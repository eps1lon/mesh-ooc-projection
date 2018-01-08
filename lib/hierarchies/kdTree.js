"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable: no-bitwise */
const bbox_1 = require("../math/bbox");
const NODE_SIZE = 10;
function build(faces, getVertices) {
    return buildNode(faces, getVertices, 0);
}
exports.default = build;
function isInternal(node) {
    // @ts-ignore: yes it does not exists thats what i want to find out
    return node.left !== undefined && node.right !== undefined;
}
exports.isInternal = isInternal;
function isLeaf(node) {
    // @ts-ignore: yes it does not exists thats what i want to find out
    return node.left === undefined && node.right === undefined;
}
exports.isLeaf = isLeaf;
// TODO: outer distance?
function inBbox(node, aabb) {
    if (bbox_1.intersect(node.bbox, aabb)) {
        if (isInternal(node)) {
            return [...inBbox(node.left, aabb), ...inBbox(node.right, aabb)];
        }
        else {
            return node.triangles;
        }
    }
    else {
        return [];
    }
}
exports.inBbox = inBbox;
function buildNode(triangles, getVertices, depth) {
    // round robin
    const split = depth % 3;
    if (triangles.length > NODE_SIZE) {
        // triangles with the minimum coord in {split} plane
        const with_min = triangles.map(triangle => {
            return {
                triangle,
                min: Math.min(...getVertices(triangle).map(p => p[split]))
            };
        });
        // sort triangles along {split} plane
        const plane_sorted = with_min.sort((a, b) => a.min - b.min);
        // split at median
        const split_index = plane_sorted.length >> 1;
        return {
            triangles,
            bbox: computeBbox(triangles, getVertices),
            left: buildNode(plane_sorted.slice(0, split_index).map(({ triangle }) => triangle), getVertices, depth + 1),
            right: buildNode(plane_sorted.slice(split_index).map(({ triangle }) => triangle), getVertices, depth + 1)
        };
    }
    else {
        return {
            triangles,
            bbox: computeBbox(triangles, getVertices)
        };
    }
}
/* tslint:disable: curly */
function computeBbox(triangles, getVertices) {
    const aabb = {
        min: [
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY
        ],
        max: [
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY
        ]
    };
    for (const triangle of triangles) {
        for (const vertex of getVertices(triangle)) {
            for (let dim = 0; dim <= 2; ++dim) {
                if (vertex[dim] < aabb.min[dim])
                    aabb.min[dim] = vertex[dim];
                if (vertex[dim] > aabb.max[dim])
                    aabb.max[dim] = vertex[dim];
            }
        }
    }
    return aabb;
}
