import { visionEmbedder } from "../ml/ML.js";

export class Frame {

    video;
    timestamp;

    imageBuffer;
    embedding;
    querySimilarity;

    constructor(video, timestamp) {
        this.video = video;
        this.timestamp = timestamp;
    }

    async extract() {
        if(this.imageBuffer) return;
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            this.video.onseeked = () => {
                canvas.width = 224;
                canvas.height = 224;
                ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(async (blob) => {
                    if (!blob) return reject(new Error("Failed to get blob"));
                    this.imageBuffer = new Uint8Array(await blob.arrayBuffer());
                    resolve();
                }, "image/jpeg");
            };
            this.video.onerror = (e) => reject(new Error("Video seek failed"));
            this.video.currentTime = this.timestamp;
        });
    }

    async embed() {
        if(!this.imageBuffer) throw new Error("Cannot embed frame before extracting!");
        this.embedding = await visionEmbedder.embed(this.toBlob());
    }

    async compareToQuery(queryEmbedding) {
        this.querySimilarity = this.embedding.cosineSimilarity(queryEmbedding);
    }

    toBlob() {
        if(!this.imageBuffer) throw new Error("Cannot blob frame before extracting!");
        const blob = new Blob([this.imageBuffer], { type: "image/jpeg" });
        return URL.createObjectURL(blob);
    }
}