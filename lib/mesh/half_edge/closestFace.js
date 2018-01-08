"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PriorityQueue = require("priorityqueuejs");
const HalfEdge_1 = require("./HalfEdge");
const vector_1 = require("../../math/vector");
const raytracing_1 = require("../../math/raytracing");
const kdTree_1 = require("../../hierarchies/kdTree");
// finds closest face that intersects with {normal}
// returns the vertex within that face which is closest to the intersection point
function closestFaceTree(origin, normal, root, depth) {
    let closest = {
        distance: Number.POSITIVE_INFINITY
    };
    // https://www.scratchapixel.com/lessons/advanced-rendering/introduction-acceleration-structure/bounding-volume-hierarchy-BVH-part2
    if (bboxDistance(origin.p, normal, root.bbox) < Number.POSITIVE_INFINITY) {
        const queue = new PriorityQueue((a, b) => {
            // smallest has highest prio
            return b.distance - a.distance;
        });
        queue.enq({ distance: 0, node: root });
        while (!queue.isEmpty() && queue.peek().distance < closest.distance) {
            const { node } = queue.deq();
            if (kdTree_1.isInternal(node)) {
                queue.enq({
                    node: node.left,
                    distance: bboxDistance(origin.p, normal, node.left.bbox)
                });
                queue.enq({
                    node: node.right,
                    distance: bboxDistance(origin.p, normal, node.right.bbox)
                });
            }
            else {
                const new_closest = closestFaceLinear(origin, normal, node.triangles);
                if (new_closest.distance < closest.distance) {
                    closest = new_closest;
                }
            }
        }
    }
    return closest;
}
exports.closestFaceTree = closestFaceTree;
function bboxDistance(o, dir, cube) {
    if (raytracing_1.pointWithinCube(o, cube)) {
        return 0;
    }
    else {
        return raytracing_1.rayIntersectionCubeUndirected(o, dir, cube);
    }
}
function closestFaceLinear(origin, normal, faces) {
    let closest;
    let closest_distance = Number.POSITIVE_INFINITY;
    for (const face of faces) {
        const intersection = raytracing_1.rayIntersectionTriangle(origin.p, normal, face, HalfEdge_1.facePoints);
        if (intersection !== undefined) {
            const distance = vector_1.distance(origin.p, intersection);
            if (distance < closest_distance) {
                closest_distance = distance;
                // TODO set to closest vertex in face
                closest = face;
            }
        }
    }
    return { face: closest, distance: closest_distance };
}
exports.closestFaceLinear = closestFaceLinear;
