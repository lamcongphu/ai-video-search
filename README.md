# 🤖🔎🎞️ AI Video Search
Find key moments in an video using natural language queries - powered by AI and running fully local in your browser powered by `transformers.js`.

# 🛠 Usage
Go to the prebuilt GitHub Page: [tobidi0410.github.io/ai-video-search/](https://tobidi0410.github.io/ai-video-search/)   
Make sure you are running the latest Chrome Browser or any other browser with <b>WebGPU support</b>!  

# ✨ How it works?
This app utilizes the `transformers.js` library for running CLIP models directly in your browser.  
Utilizing `Xenova/clip-vit-large-patch14-336`, we can generate both visual and textual embeddings.  
The model generates embeddings for each frame in the video as well as for the text query. 
After that we can simply compare the frame embeddings to the query embedding (cosineSimilarity) and calculate a match score.  

# 📝License & Attribution
- [Xenova/clip-vit-large-patch14-336](https://huggingface.co/Xenova/clip-vit-large-patch14-336) - by Xenova
- [transformers.js](https://github.com/huggingface/transformers.js/) — by Huggingface — [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [DaisyUI](https://github.com/saadeghi/daisyui) — by saadeghi — [MIT](https://opensource.org/licenses/MIT)
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) — by Tailwind Labs — [MIT](https://opensource.org/licenses/MIT)
- [Material Design Icons](https://github.com/google/material-design-icons) — by Google — [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [parcel](https://github.com/parcel-bundler/parcel) — by Parcel-Bundler — [MIT](https://opensource.org/licenses/MIT)