"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const read_1 = require("../read");
function default_1(filename, options = {}) {
    const { delimiter, highWaterMark = 64 * 1024 } = options;
    return fs_1.createReadStream(filename, { highWaterMark }).pipe(read_1.default(delimiter));
}
exports.default = default_1;
