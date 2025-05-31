import { getMLDevice, textEmbedder, visionEmbedder } from "./ml/ML.js";
import { getFramesPerSecond, getVideoFile } from "./video/FrameExtractor.js";

let frames = [];

async function handleUpload() {
  try {
    //Prompt and load video
    const file = await getVideoFile();
    const video = document.querySelector("#VIDEO_PREVIEW");
    await new Promise((resolve, reject) => {
        video.src = URL.createObjectURL(file);
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.preload = "auto";
        video.onloadedmetadata = () => resolve(video);
        video.onerror = (e) => reject("Failed to load video.");
    });
  } catch (err) {
    console.error(err);
  }
  handleAnalysis();
}

let lastAnalysisID = 0;
async function handleAnalysis() {
    const analysisID = Math.random();
    lastAnalysisID = analysisID;
    try {
        const video = document.querySelector("#VIDEO_PREVIEW");
        const framesPerSecond = document.querySelector("#VIDEO_FPS").value;
        if(framesPerSecond <= 0) return;

        //Extract video frams
        frames = await getFramesPerSecond(video, framesPerSecond);
        for(const [index, frame] of Object.entries(frames)) {
            await frame.extract();
            const progress = (((index/(frames.length-1))*100.0)|0).toFixed(2)||0;
            document.querySelector("#VIDEO_EXTRACT_STATE").innerHTML = `${index} / ${frames.length-1} (${progress}%)...`;
            document.querySelector("#VIDEO_EXTRACT_BAR").value = progress;
            if(lastAnalysisID != analysisID) return;
        }
        document.querySelector("#VIDEO_EXTRACT_STATE").innerHTML = `Done!`;
        document.querySelector("#VIDEO_EXTRACT_BAR").value = 100;

        //Embed video frams
        for(const [index, frame] of Object.entries(frames)) {
            await frame.embed();
            const progress = (((index/(frames.length-1))*100.0)|0).toFixed(2);
            document.querySelector("#VIDEO_ANALYZE_STATE").innerHTML = `${index} / ${frames.length-1} (${progress}%)...`;
            document.querySelector("#VIDEO_ANALYZE_BAR").value = progress;
            if(lastAnalysisID != analysisID) return;
        }
        document.querySelector("#VIDEO_ANALYZE_STATE").innerHTML = `Done!`;
        document.querySelector("#VIDEO_ANALYZE_BAR").value = 100;

    } catch (err) {
        console.error(err);
    }
}
document.querySelector("#VIDEO_UPLOAD").addEventListener("click", handleUpload);
document.querySelector("#VIDEO_FPS").addEventListener("input", handleAnalysis);

async function handleQuery() {
    const query = document.querySelector("#QUERY_INPUT").value;
    if(!query) return;

    //Generate text embedding
    document.querySelector("#QUERY_ANALYZE_STATE").innerHTML = `Analyzing...`;
    document.querySelector("#QUERY_ANALYZE_BAR").value = 1;
    const textEmbedding = await textEmbedder.embed(query);
    document.querySelector("#QUERY_ANALYZE_STATE").innerHTML = `Analyzed!`;
    document.querySelector("#QUERY_ANALYZE_BAR").value = 100;

    //Sort frame embeddings by text
    document.querySelector("#QUERY_EXECUTE_STATE").innerHTML = `Analyzing...`;
    for(const [index, frame] of Object.entries(frames)) {
        await frame.compareToQuery(textEmbedding);
        const progress = ((index/(frames.length-1))*100.0).toFixed(2);
        document.querySelector("#QUERY_EXECUTE_STATE").innerHTML = `${index} / ${frames.length-1} (${progress}%)...`;
        document.querySelector("#QUERY_EXECUTE_BAR").value = progress;
    }
    document.querySelector("#QUERY_EXECUTE_STATE").innerHTML = `Done!`;
    document.querySelector("#QUERY_EXECUTE_BAR").value = 100;

    const sortedFrameEmbeddings = frames.sort((a,b) => b.querySimilarity - a.querySimilarity);

    //Draw top 10 matches
    document.querySelector("#MATCHES").innerHTML = "";
    const top10Frames = sortedFrameEmbeddings.slice(0, 10);
    for(const frame of top10Frames) {
        document.querySelector("#MATCHES").innerHTML += `<div onclick="document.querySelector('#VIDEO_PREVIEW').currentTime = ${frame.timestamp}">
            <a>${frame.timestamp} (${frame.querySimilarity})</a>
            <img class="h-32" src="${frame.toBlob()}"></img>
        </div>`;
        //const { canvas } = await extractFrameAt(document.querySelector("#VIDEO_PREVIEW"), frame.index+1);
        //canvas.classList.add("h-48");
        //document.querySelector("#MATCHES").appendChild(canvas);
    }
    console.log(sortedFrameEmbeddings);
}
document.querySelector("#QUERY_RUN").addEventListener("click", handleQuery);

async function startup() {
    document.querySelector("#NO_JS").classList.add("hidden");
    const mlDevice = await getMLDevice();
    console.log("ML Device", mlDevice);
    if(mlDevice == "webgpu") document.querySelector("#NO_ACCEL").classList.add("hidden");
    
    await visionEmbedder.load((data) => {
        if(data.status == "done") document.querySelector("#VISION_MODEL_STATE").innerHTML = "Ready!";
        if(data.status == "progress") {
            document.querySelector("#VISION_MODEL_STATE").innerHTML = `Downloading '${data.file}' (${(data.progress*1.0).toFixed(2)}%)...`;
            document.querySelector("#VISION_MODEL_BAR").value = data.progress;
        }
    });
    await textEmbedder.load((data) => {
        if(data.status == "done") document.querySelector("#TEXT_MODEL_STATE").innerHTML = "Ready!";
        if(data.status == "progress") {
            document.querySelector("#TEXT_MODEL_STATE").innerHTML = `Downloading '${data.file}' (${(data.progress*1.0).toFixed(2)}%)...`;
            document.querySelector("#TEXT_MODEL_BAR").value = data.progress;
        }
    });
}
startup();
