import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from '@huggingface/transformers';
import { CLIPEmbedding } from './CLIPEmbedding';
import { getMLDevice } from './ML';

export class CLIPVisionEmbedder {

    processor;
    model;
    modelName;

    constructor(modelName) {
        this.modelName = modelName;
    }

    isLoaded() {
        return this.processor && this.model;
    }

    async load(progress_callback) {
        if(this.isLoaded()) return;
        this.processor = await AutoProcessor.from_pretrained(this.modelName);
        console.log("[CLIPVisionEmbedder]", "Loaded processor!");
        this.model = await CLIPVisionModelWithProjection.from_pretrained(this.modelName, { 
            device: await getMLDevice(),
            progress_callback
        });
        console.log("[CLIPVisionEmbedder]", "Loaded model '" + this.modelName + "'!");
    }

    async embed(imageObject) {
        if(!this.isLoaded()) throw new Error("Embedder needs to be loaded before use!");
        const image = await RawImage.read(imageObject);
        const image_inputs = await this.processor(image);
        const { image_embeds } = await this.model(image_inputs);
        return new CLIPEmbedding(image_embeds);
    }

    async embedBatch(objs, progress_callback) {
        if(!this.isLoaded()) throw new Error("Embedder needs to be loaded before use!");
        const embeds = [];
        for(const [index, obj] of Object.entries(objs)) {
            embeds.push(await this.embed(obj));
            if(progress_callback) progress_callback({ status: 'progress', current: index, total: objs.length, progress: (index/(objs.length-1))*100 });
        }
        progress_callback({ status: 'done', total: objs.length });
        return embeds;
    }

    async unload() {
        this.processor = null;
        console.log("[CLIPVisionEmbedder]", "Unloaded processor!");
        this.model = null;
        console.log("[CLIPVisionEmbedder]", "Unloaded model!");
    }
}