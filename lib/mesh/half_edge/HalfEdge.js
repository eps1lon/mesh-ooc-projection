"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bbox_1 = require("../../math/bbox");
const vector_1 = require("../../math/vector");
const facette_1 = require("../../math/facette");
function clockwise(edge) {
    return edge.inverse !== undefined ? edge.inverse.next : undefined;
}
exports.clockwise = clockwise;
function counterClockwise(edge) {
    return edge.prev.inverse;
}
exports.counterClockwise = counterClockwise;
function* circulate(vertex, next) {
    const first_edge = vertex.edge;
    if (first_edge === undefined) {
        return;
    }
    let next_edge = next(first_edge);
    yield first_edge;
    while (next_edge !== undefined && next_edge !== first_edge) {
        yield next_edge;
        next_edge = next(next_edge);
    }
}
exports.circulate = circulate;
/**
 *
 * @param vertex
 * @return HalfEdge[] orderd counter clockwise
 */
function outgoingEdges(vertex) {
    // first iterate to left
    const edges_left = [...circulate(vertex, counterClockwise)]; // this.outgoindEdges(vertex, edge => edge.prev.inverse);
    // then right
    // small overhead at cost of readability => blindly iterate again
    const edges_right = [...circulate(vertex, clockwise)];
    // 1 offset for middle
    if (edges_left[edges_left.length - 1] === edges_right[1]) {
        // full circle => edges_left === edges_right
        return edges_left;
    }
    else {
        // counter clockwise
        return edges_left.concat(edges_right.slice(1).reverse());
    }
}
exports.outgoingEdges = outgoingEdges;
function origin(edge) {
    return edge.prev.target;
}
exports.origin = origin;
/**
 * Finds twin/opposite/inverse half edge of {edge}
 * O(n) where n is the number of outgoing edges from {edge.target}
 *
 * @param source
 * @param edge outgoing edge from {source}
 */
function inverseEdge(source, edge) {
    return outgoingEdges(edge.target).find(other => other.target === source);
}
exports.inverseEdge = inverseEdge;
/**
 * @param triangle
 * @return 3d coords of each vertex in {face}
 */
function facePoints(triangle) {
    const u = triangle.edge;
    const v = u.next;
    const w = v.next;
    return [u.target.p, v.target.p, w.target.p];
}
exports.facePoints = facePoints;
function computeBbox(mesh) {
    return bbox_1.default(mesh.vertices, vertex => vertex.p);
}
exports.computeBbox = computeBbox;
/**
 * iterates over each edge that shares a face with {start}
 * excludes {start}
 * @param start
 */
function* faceEdges(start) {
    let cur = start.next;
    while (cur !== start) {
        yield cur;
        cur = cur.next;
    }
}
exports.faceEdges = faceEdges;
function distance(source, target) {
    return vector_1.distance(source.p, target.p);
}
exports.distance = distance;
function innerAngle(e1, e2) {
    const N = plane(e1, e2);
    const p1 = origin(e1).p;
    const p2 = e1.target.p;
    const p3 = e2.target.p;
    const u = vector_1.normalize(vector_1.sub(p1, p2));
    const v = vector_1.normalize(vector_1.sub(p3, p2));
    const cosine = vector_1.dot(u, v);
    let angle = Math.acos(cosine);
    // rounding error
    if (Number.isNaN(angle)) {
        if (cosine > 0) {
            angle = Number.EPSILON;
        }
        else {
            angle = Math.PI - Number.EPSILON;
        }
    }
    if (vector_1.dot(vector_1.cross(u, v), N) < 0) {
        return 2 * Math.PI - angle;
    }
    else {
        return angle;
    }
}
exports.innerAngle = innerAngle;
function plane(...edges) {
    let n = vector_1.default(0, 0, 0);
    for (const edge of edges) {
        n = vector_1.add(n, facette_1.normalRight(facePoints(edge.face)));
        if (edge.inverse !== undefined) {
            n = vector_1.add(n, facette_1.normalRight(facePoints(edge.inverse.face)));
        }
    }
    return vector_1.normalize(n);
}
exports.plane = plane;
