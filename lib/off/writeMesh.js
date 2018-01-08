"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const nodes = require("../off/nodes");
const write_1 = require("../off/streams/write");
async function writeMesh(mesh, path) {
    return new Promise((resolve, reject) => {
        // FIXME offWriteStream().pipe(fswriteStream) throws
        const out_stream = fs.createWriteStream(path);
        out_stream.on('error', err => reject(err));
        const write_stream = write_1.default().on('data', (data) => out_stream.write(data));
        write_stream.write(nodes.format('COFF'));
        write_stream.write(nodes.meta(mesh.vertices.length, mesh.faces.length, 0));
        mesh.vertices.forEach((vertex, i) => {
            const [x, y, z] = vertex.p;
            const { color } = vertex.attributes;
            if (color !== undefined) {
                write_stream.write(nodes.coloredVertex(x, y, z, color[0], color[1], color[2]));
            }
            else {
                write_stream.write(nodes.vertex(x, y, z));
            }
        });
        mesh.faces.forEach(({ vertices }) => {
            const [a, b, c] = vertices;
            write_stream.write(nodes.face(a, b, c));
        });
        write_stream.end(() => {
            resolve();
        });
    });
}
exports.default = writeMesh;
