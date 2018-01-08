"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FaceMesh_1 = require("../mesh/FaceMesh");
const fileRead_1 = require("./streams/pipes/fileRead");
const nodes_1 = require("./nodes");
function loadMesh(file_path, options = {}) {
    return new Promise((resolve, reject) => {
        const stream = fileRead_1.default(file_path, options);
        const vertices = [];
        const faces = [];
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(new FaceMesh_1.default(vertices, faces)));
        // put stream in flowing mode
        stream.on('data', (node) => {
            if (nodes_1.isFace(node)) {
                faces.push({ vertices: node.vertices });
            }
            else if (nodes_1.isVertex(node)) {
                if (nodes_1.isColoredVertex(node)) {
                    vertices.push({
                        p: [node.x, node.y, node.z],
                        attributes: {
                            color: [node.color.r, node.color.g, node.color.b]
                        }
                    });
                }
                else {
                    vertices.push({
                        p: [node.x, node.y, node.z],
                        attributes: {}
                    });
                }
            }
        });
    });
}
exports.default = loadMesh;
