import { CLIPTextEmbedder } from "./CLIPTextEmbedder.js";
import { CLIPVisionEmbedder } from "./CLIPVisionEmbedder.js";

export async function checkGPU() {
    if(!navigator.gpu) return false;
    try {
        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter.requestDevice();
        return true;
    } catch(err) {
        return false;
    }
}


export async function getMLDevice() {
    return navigator.ml ? "webnn" : await checkGPU() ? "webgpu" : "wasm";
}

export const visionEmbedder = new CLIPVisionEmbedder('Xenova/clip-vit-large-patch14');
export const textEmbedder = new CLIPTextEmbedder('Xenova/clip-vit-large-patch14');