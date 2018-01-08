"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kdTree_1 = require("../../hierarchies/kdTree");
const HalfEdge_1 = require("./HalfEdge");
var kdTree_2 = require("../../hierarchies/kdTree");
exports.isInternal = kdTree_2.isInternal;
exports.isLeaf = kdTree_2.isLeaf;
function build(faces) {
    return kdTree_1.default(faces, HalfEdge_1.facePoints);
}
exports.default = build;
