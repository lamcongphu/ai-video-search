import { CLIPTextEmbedder } from "./CLIPTextEmbedder.js";
import { CLIPVisionEmbedder } from "./CLIPVisionEmbedder.js";

export const visionEmbedder = new CLIPVisionEmbedder('Xenova/clip-vit-large-patch14');
export const textEmbedder = new CLIPTextEmbedder('Xenova/clip-vit-large-patch14');