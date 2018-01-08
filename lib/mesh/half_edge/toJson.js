"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// return non-circular structures
function meshToJson(mesh) {
    return {
        edges: mesh.edges.map(edgeToJson),
        faces: mesh.faces.map(faceToJson),
        vertices: mesh.vertices.map(vertexToJson)
    };
}
exports.meshToJson = meshToJson;
function faceToJson(face) {
    return {
        id: face.id,
        edge: face.edge.id
    };
}
exports.faceToJson = faceToJson;
function edgeToJson(edge) {
    return {
        id: edge.id,
        target: edge.target.id,
        prev: edge.prev.id,
        next: edge.next.id,
        inverse: edge.inverse ? edge.inverse.id : undefined,
        face: edge.face.id
    };
}
exports.edgeToJson = edgeToJson;
function vertexToJson(vertex) {
    return {
        id: vertex.id,
        attributes: vertex.attributes,
        edge: vertex.edge ? vertex.edge.id : undefined,
        p: vertex.p
    };
}
exports.vertexToJson = vertexToJson;
