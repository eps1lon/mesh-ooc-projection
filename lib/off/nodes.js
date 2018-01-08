"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function vertex(x, y, z) {
    return {
        type: 'vertex',
        x,
        y,
        z
    };
}
exports.vertex = vertex;
function coloredVertex(x, y, z, r, g, b) {
    return Object.assign({}, vertex(x, y, z), { color: { r, g, b } });
}
exports.coloredVertex = coloredVertex;
function isVertex(node) {
    return node.type === 'vertex';
}
exports.isVertex = isVertex;
function isColoredVertex(other) {
    return other.hasOwnProperty('color');
}
exports.isColoredVertex = isColoredVertex;
function face(a, b, c) {
    return {
        type: 'face',
        vertices: [a, b, c]
    };
}
exports.face = face;
function isFace(node) {
    return node.type === 'face';
}
exports.isFace = isFace;
function format(ply_format) {
    return { type: 'format', format: ply_format };
}
exports.format = format;
function isFormat(node) {
    return node.type === 'format';
}
exports.isFormat = isFormat;
function meta(vertices, faces, edges = 0) {
    return {
        type: 'meta',
        vertex_count: vertices,
        face_count: faces,
        edge_count: edges
    };
}
exports.meta = meta;
function isMeta(node) {
    return node.type === 'meta';
}
exports.isMeta = isMeta;
