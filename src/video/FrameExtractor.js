import { Frame } from "./Frame.js";

export async function getVideoFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    return await new Promise((resolve) => {
        input.onchange = () => resolve(input.files[0]);
        input.click();
    });
}

export async function loadVideo(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.preload = "auto";
        video.onloadedmetadata = () => resolve(video);
        video.onerror = (e) => reject("Failed to load video.");
    });
}

export async function getFramesPerSecond(video, framesPerSecond, progress_callback) {
    const frames = [];
    const duration = Math.floor(video.duration);
    const totalFrames = duration*framesPerSecond;
    for(let frame = 0; frame < totalFrames; frame++)
        frames.push(new Frame(video, frame/framesPerSecond));
    return frames;
}