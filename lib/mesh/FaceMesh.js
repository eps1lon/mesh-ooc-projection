"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bbox_1 = require("../math/bbox");
const kdTree_1 = require("../hierarchies/kdTree");
class FaceMesh {
    constructor(vertices, faces) {
        this.vertices = vertices;
        this.faces = faces;
    }
    computeBbox() {
        return bbox_1.default(this.vertices, vertex => vertex.p);
    }
    dereference(face) {
        return [
            this.vertices[face.vertices[0]].p,
            this.vertices[face.vertices[1]].p,
            this.vertices[face.vertices[2]].p
        ];
    }
    faceVertices(face) {
        return [
            this.vertices[face.vertices[0]],
            this.vertices[face.vertices[1]],
            this.vertices[face.vertices[2]]
        ];
    }
    buildKdTree() {
        return kdTree_1.default(this.faces, face => this.dereference(face));
    }
}
exports.default = FaceMesh;
