import { AutoTokenizer, CLIPTextModelWithProjection } from '@huggingface/transformers';
import { CLIPEmbedding } from './CLIPEmbedding';
import { getMLDevice } from './ML';

export class CLIPTextEmbedder {

    tokenizer;
    model;
    modelName;

    constructor(modelName) {
        this.modelName = modelName;
    }

    isLoaded() {
        return this.tokenizer && this.model;
    }

    async load(progress_callback) {
        if(this.isLoaded()) return;
        this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
        console.log("[CLIPTextEmbedder]", "Loaded tokenizer!");
        this.model = await CLIPTextModelWithProjection.from_pretrained(this.modelName, { 
            device: getMLDevice(),
            progress_callback
        });
        console.log("[CLIPTextEmbedder]", "Loaded model '" + this.modelName + "'!");
    }

    async embed(text) {
        if(!this.isLoaded()) throw new Error("Embedder needs to be loaded before use!");
        const texts = [text];
        const text_inputs = await this.tokenizer(texts, { padding: true, truncation: true });
        const { text_embeds } = await this.model(text_inputs);
        return new CLIPEmbedding(text_embeds);
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
        this.tokenizer = null;
        console.log("[CLIPTextEmbedder]", "Unloaded processor!");
        this.model = null;
        console.log("[CLIPTextEmbedder]", "Unloaded model!");
    }
}