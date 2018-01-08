"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable: no-console */
const path = require("path");
const fs_1 = require("../../util/fs");
const OocCluster_1 = require("./OocCluster");
/**
 * @param {string} filename
 * @param {boolean} vertex_geometry load so that every triangle incident
 *                  in the contained vertices are loaded
 * @param {boolean} root don't set this value. it's used to determine what
 *                  parts of the cluster are writeable
 */
async function loadRegular(filepath) {
    const file = (await fs_1.readFile(filepath)).toString('utf8');
    const vertex_flags = OocCluster_1.FileFlags.read_write;
    const vertices = [];
    const faces = [];
    // O(v+f)
    for (const line of file.split('\n')) {
        if (isVertex(line)) {
            vertices.push(Object.assign({}, readVertex(line), { flags: vertex_flags }));
        }
        else if (isFace(line)) {
            faces.push(readFace(line));
        }
    }
    // => O(v + f)
    return new OocCluster_1.default(vertices, faces, path.basename(filepath));
}
exports.default = loadRegular;
async function loadWithAdjacent(filepath) {
    const dir = path.dirname(filepath);
    const root = await loadRegular(filepath);
    const needed_vertices = new Set(root.partialFaces().reduce((vertices, face) => {
        vertices.push(...face.vertices);
        return vertices;
    }, []));
    await Promise.all([...root.adjacent].map(async (adjacent_id) => {
        const adjacent = await loadRegular(path.join(dir, adjacent_id));
        root.vertices.push(...adjacent.vertices
            .filter(({ vertex_id }) => needed_vertices.has(vertex_id))
            .map(vertex => {
            return Object.assign({}, vertex, { flags: OocCluster_1.FileFlags.read });
        }));
        root.adjacent_included.add(adjacent_id);
        return;
    }));
    return root;
}
exports.loadWithAdjacent = loadWithAdjacent;
function isVertex(line) {
    return line.split(' ').length === 9;
}
function readVertex(line) {
    const [vertex_id, x, y, z, r, g, b, segment_index, projected_heuristic] = line.split(' ');
    const color = r !== '' && b !== '' && b !== '' ? [+r, +g, +b] : undefined;
    return {
        flags: OocCluster_1.FileFlags.read,
        vertex_id: +vertex_id,
        p: [+x, +y, +z],
        attributes: {
            color,
            segment: segment_index === '' ? undefined : +segment_index,
            projected_heuristic: projected_heuristic === ''
                ? Number.POSITIVE_INFINITY
                : +projected_heuristic
        }
    };
}
function isFace(line) {
    const adjacent = line.split(' ')[4];
    return Boolean(typeof adjacent === 'string' &&
        (adjacent === '' || adjacent.startsWith('x')));
}
function readFace(line) {
    const [, vertex_a, vertex_b, vertex_c, adjacent_clusters] = line.split(' ');
    return {
        vertices: [+vertex_a, +vertex_b, +vertex_c],
        adjacent_clusters: 
        // avoid ''.split() => ['']
        adjacent_clusters.length > 0 ? adjacent_clusters.split(',') : []
    };
}
