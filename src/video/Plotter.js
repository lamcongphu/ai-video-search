export class Plotter {
    canvas;
    ctx;
    width;
    height;

    minX = 0;
    rangeX = 0;
    points = null;
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

        if (redraw && this.points) {
            this.plot(this.points, this.color);
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

    plot(points, color = "blue") {
        this.points = points;
        this.color = color;

        this.clear();
        this.drawGrid();

        const ctx = this.ctx;
        const len = points.length;
        if (len < 2) return;

        // Extract X and Y values for scaling
        const xVals = points.map(p => p[0]);
        const yVals = points.map(p => p[1]);

        const minX = Math.min(...xVals);
        this.minX = minX;
        const maxX = Math.max(...xVals);
        const minY = Math.min(...yVals);
        const maxY = Math.max(...yVals);

        const rangeX = maxX - minX || 1;
        this.rangeX = rangeX;
        const rangeY = maxY - minY || 1;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        for (let i = 0; i < len; i++) {
            const [xVal, yVal] = points[i];

            const x = ((xVal - minX) / rangeX) * this.width;
            const y = this.height - ((yVal - minY) / rangeY) * this.height;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();
    }

    mousemove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const x = (e.clientX - rect.left) * scaleX;
        const relX = x / this.canvas.width;
        const video = document.querySelector("#VIDEO_PREVIEW");
        video.currentTime = this.minX + this.rangeX * relX;
    }
}