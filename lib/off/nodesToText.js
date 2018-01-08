"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodes_1 = require("./nodes");
function toText(node) {
    switch (node.type) {
        case 'vertex':
            return vertex(node);
        case 'face':
            return face(node);
        case 'format':
            return format(node);
        case 'meta':
            return meta(node);
    }
}
exports.default = toText;
function vertex(vertex_node) {
    const { x, y, z } = vertex_node;
    let line = [x, y, z].join(' ');
    if (nodes_1.isColoredVertex(vertex_node)) {
        const { r, g, b } = vertex_node.color;
        line = `${line} ${[r, g, b].join(' ')}`;
    }
    return line;
}
function face({ vertices }) {
    return `${vertices.length} ${vertices.join(' ')}`;
}
function format(node) {
    return node.format;
}
function meta({ vertex_count, face_count, edge_count }) {
    return [vertex_count, face_count, edge_count].join(' ');
}
