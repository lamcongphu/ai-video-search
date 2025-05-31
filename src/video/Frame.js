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

            const targetSize = 336;
            canvas.width = targetSize;
            canvas.height = targetSize;

            this.video.onseeked = () => {
                const videoW = this.video.videoWidth;
                const videoH = this.video.videoHeight;

                // Fill background with black (optional: ctx.fillStyle = "#000000" is default)
                ctx.fillRect(0, 0, targetSize, targetSize);

                // Calculate scaling factor
                const scale = Math.min(targetSize / videoW, targetSize / videoH);
                const newW = videoW * scale;
                const newH = videoH * scale;

                const dx = (targetSize - newW) / 2;
                const dy = (targetSize - newH) / 2;

                // Draw resized video frame centered
                ctx.drawImage(this.video, dx, dy, newW, newH);

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