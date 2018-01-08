"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("./vector");
function triangle(u, v, w) {
    return [u, v, w];
}
exports.default = triangle;
// normal according to right hand rule
function normalRight(t) {
    return vector_1.cross(vector_1.sub(t[2], t[0]), vector_1.sub(t[1], t[0]));
}
exports.normalRight = normalRight;
// normal according to left hand rule
function normalLeft(t) {
    return vector_1.cross(vector_1.sub(t[1], t[0]), vector_1.sub(t[2], t[0]));
}
exports.normalLeft = normalLeft;
