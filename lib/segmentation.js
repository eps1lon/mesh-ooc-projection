"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./util/fs");
// if no segment index has been assigned yet
// positive indices are for chambers
// -1 for passages
exports.UNDEFINED_INDEX = -2;
function initIndices(num_vertices) {
    return new Int32Array(num_vertices).fill(exports.UNDEFINED_INDEX);
}
exports.initIndices = initIndices;
async function load(filepath) {
    const file = await fs_1.readFile(filepath);
    return new Int32Array(file.buffer);
}
exports.load = load;
async function write(filepath, indices) {
    // @ts-ignore: node documentation says "or the .buffer property of a TypedArray."
    return await fs_1.writeFile(filepath, Buffer.from(indices.buffer));
}
exports.write = write;
