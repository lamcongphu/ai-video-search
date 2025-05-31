export class Plotter {
    canvas;
    ctx;
    width;
    height;

    values = null;
    color = "blue";

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.resize();
        window.addEventListener("resize", () => this.resize(true)); // redraw if needed
        this.canvas.addEventListener("mousemove", (e) => this.mousemove(e));
    }

    resize(redraw = false) {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;

        if (redraw && this.values) {
            this.plot(this.values, this.color);
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawGrid(spacing = 50) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;

        for (let x = 0; x < this.width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        for (let y = 0; y < this.height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }

    plot(values, color = "blue") {
        // 🔹 Save for redraw
        this.values = values;
        this.color = color;

        this.clear();
        this.drawGrid();

        const ctx = this.ctx;
        const len = values.length;
        if (len < 2) return;

        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        for (let i = 0; i < len; i++) {
            const x = (i / (len - 1)) * this.width;
            const normY = (values[i] - min) / range;
            const y = this.height - normY * this.height;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();
    }

    mousemove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const relX = x / this.canvas.width;
        const video = document.querySelector("#VIDEO_PREVIEW");
        if (video?.duration) {
            video.currentTime = video.duration * relX;
        }
    }
}