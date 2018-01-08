"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
const nodes = require("../../off/nodes");
const nodesToText_1 = require("../../off/nodesToText");
const OocCluster_1 = require("./OocCluster");
function writeBack(cluster, dir) {
    return new Promise((resolve, reject) => {
        const file = fs_1.createWriteStream(path.join(dir, cluster.name));
        file.on('error', err => reject(err));
        writeVertices(cluster, file);
        writeFaces(cluster, file);
        file.end(() => resolve());
    });
}
exports.writeBack = writeBack;
function writeVertices(cluster, file) {
    cluster.vertices.forEach(vertex => {
        if (vertex.flags === OocCluster_1.FileFlags.read_write) {
            writeVertex(file, vertex.vertex_id, vertex);
        }
    });
}
function writeVertex(file, vertex_id, vertex) {
    // will be read as undefined
    const empty_string = '';
    const line = [
        vertex.p[0].toString(),
        vertex.p[1].toString(),
        vertex.p[2].toString()
    ];
    if (vertex.attributes.color !== undefined) {
        line.push(...vertex.attributes.color);
    }
    else {
        line.push(...[empty_string, empty_string, empty_string]);
    }
    if (vertex.attributes.segment !== undefined) {
        line.push(vertex.attributes.segment);
    }
    else {
        line.push(empty_string);
    }
    if (vertex.attributes.projected_heuristic !== undefined &&
        vertex.attributes.projected_heuristic !== Number.POSITIVE_INFINITY) {
        line.push(asciiNum(vertex.attributes.projected_heuristic));
    }
    else {
        line.push(empty_string);
    }
    file.write(`${vertex_id} ${line.join(' ')}\n`);
}
exports.writeVertex = writeVertex;
function writeFaces(cluster, file) {
    cluster.writeableFaces().forEach(face => {
        writeFace(file, nodes.face(face.vertices[0], face.vertices[1], face.vertices[2]), face.adjacent_clusters);
    });
}
function writeFace(file, face, clusters_of_face) {
    file.write(`${nodesToText_1.default(face)} ${clusters_of_face}\n`);
}
exports.writeFace = writeFace;
// float to string for ascii file formats
function asciiNum(n) {
    // to fixed adds trailing zeros, converting trailing zeros to num removes them
    return +n.toFixed(4);
}
