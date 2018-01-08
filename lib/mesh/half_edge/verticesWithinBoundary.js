"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HalfEdge_1 = require("./HalfEdge");
const shortestPath_1 = require("./shortestPath");
/**
 *
 * @param vertices hull, must be closed, and counter clockwise
 */
function verticesWithinBoundary(boundary, upper_bound) {
    // boundary cant have an area
    const distinct_vertices = new Set(boundary);
    if (distinct_vertices.size < boundary.length) {
        return distinct_vertices;
    }
    let boundary_edges = [];
    try {
        boundary_edges = closedBoundary(boundary);
    }
    catch (err) {
        // TODO remove this. Should not happen on release
        /* tslint:disable-next-line: no-console */
        console.warn(err);
        return new Set();
    }
    const { inner, outer } = shortestPath_1.pathAngle(boundary_edges);
    if (inner <= outer) {
        return new Set(growInwards(boundary_edges, upper_bound));
    }
    else {
        // we traversed the boundary in such a way
        // that edge.next is not within the boundary
        return new Set(growInwards(outerBoundary(boundary_edges), upper_bound));
    }
}
exports.default = verticesWithinBoundary;
function closedBoundary(boundary) {
    const boundary_edges = [];
    for (let i = 0; i < boundary.length - 1; ++i) {
        boundary_edges.push(...shortestPath_1.default(boundary[i], boundary[i + 1]));
    }
    // and close the loop
    boundary_edges.push(...shortestPath_1.default(boundary[boundary.length - 1], boundary[0]));
    return boundary_edges;
}
function outerBoundary(boundary) {
    const outer = new Array(boundary.length);
    for (let i = 0; i < boundary.length; ++i) {
        const inner = boundary[i];
        if (inner.inverse !== undefined) {
            outer[i] = inner.inverse;
        }
    }
    return outer;
}
//
function* growInwards(boundary, upper_bound) {
    const edges = new Set(boundary);
    const region = new Set();
    const open = boundary.slice();
    const visited = new Set();
    while (open.length > 0) {
        const edge = open.pop();
        if (edge === undefined) {
            break;
        }
        if (region.size > upper_bound) {
            throw new Error('growInwards: upper bound exceeded');
        }
        if (visited.has(edge)) {
            continue;
        }
        if (!region.has(edge.target)) {
            yield edge.target;
        }
        visited.add(edge);
        region.add(edge.target);
        if (!edges.has(edge) && edge.inverse && !visited.has(edge.inverse)) {
            open.unshift(edge.inverse);
        }
        // only iterate over edges of the face if it is not part of a sliver
        if (!edge.inverse || !edges.has(edge.inverse)) {
            // since the edges in the hull were given counter clockwise
            // every face of those edges lies inwards
            // so iterate over each edge in that face an add the inverse of the other
            // edges
            for (const face_edge of HalfEdge_1.faceEdges(edge)) {
                if (!visited.has(face_edge)) {
                    open.unshift(face_edge);
                }
            }
        }
    }
}
