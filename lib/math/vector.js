"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function vector(x, y, z) {
    return [x, y, z];
}
exports.default = vector;
function cross(u, v) {
    return vector(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]);
}
exports.cross = cross;
function dot(u, v) {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}
exports.dot = dot;
function add(u, v) {
    return vector(u[0] + v[0], u[1] + v[1], u[2] + v[2]);
}
exports.add = add;
function sub(u, v) {
    return vector(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
}
exports.sub = sub;
function scalarMul(t, u) {
    return vector(t * u[0], t * u[1], t * u[2]);
}
exports.scalarMul = scalarMul;
function length(v) {
    return Math.hypot(v[0], v[1], v[2]);
}
exports.length = length;
function distance(u, v) {
    return Math.hypot(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
}
exports.distance = distance;
function normalize(v) {
    const l = length(v);
    return vector(v[0] / l, v[1] / l, v[2] / l);
}
exports.normalize = normalize;
function project(p, n) {
    // p - (n dot p) * n
    return sub(p, scalarMul(dot(n, p), n));
}
exports.project = project;
function invert(v) {
    return vector(-v[0], -v[1], -v[2]);
}
exports.invert = invert;
