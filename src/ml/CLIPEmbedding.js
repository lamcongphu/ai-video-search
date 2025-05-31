export class CLIPEmbedding {
    constructor(tensor) {
        this.tensor = tensor; // ort.Tensor
        this._vector = null;  // cached Float32Array
    }

    // Get raw vector data
    get vector() {
        if (!this._vector) {
            this._vector = new Float32Array(this.tensor.data);
        }
        return this._vector;
    }

    // Return a new CLIPEmbedding instance with normalized vector
    normalize() {
        const norm = Math.sqrt(this.vector.reduce((sum, val) => sum + val * val, 0));
        const normalized = new Float32Array(this.vector.map(v => v / norm));
        return new CLIPEmbedding({ data: normalized, dims: this.tensor.dims });
    }

    // Cosine similarity to another CLIPEmbedding
    cosineSimilarity(other) {
        const a = this.vector;
        const b = other.vector;
        if (a.length !== b.length) {
            throw new Error("Embedding dimensions do not match.");
        }
        return a.reduce((sum, val, i) => sum + val * b[i], 0);
    }
}