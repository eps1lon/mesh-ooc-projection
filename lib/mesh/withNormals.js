"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const facette_1 = require("../math/facette");
const vector_1 = require("../math/vector");
const FaceMesh_1 = require("./FaceMesh");
function build(mesh) {
    const vertices = mesh.vertices.map(vertex => {
        // init identity normal
        return Object.assign({}, vertex, { normal: vector_1.default(0, 0, 0) });
    });
    // face pass:
    // calculate face normal
    // add face normal to vertices of that face
    const faces = mesh.faces.map(face => {
        const soup = mesh.dereference(face);
        const normal = facette_1.normalRight(soup);
        // only add "outwards" facing normal to vertex normal
        for (let i = 0; i <= 2; ++i) {
            // vertices[face[i]].normal += normal
            vertices[face.vertices[i]].normal = vector_1.add(vertices[face.vertices[i]].normal, normal);
        }
        return Object.assign({}, face, { normal });
    });
    return new FaceMesh_1.default(vertices, faces);
}
exports.default = build;
