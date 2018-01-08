"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const through = require('through2');
const nodesToText_1 = require("../nodesToText");
function offWriteStream(options = {}) {
    const { delim = '\r\n', limit = Number.POSITIVE_INFINITY } = options;
    // chars
    let written = 0;
    return through({ objectMode: true }, function (node, enc, done) {
        const text = nodesToText_1.default(node) + delim;
        if (written >= limit) {
            this.push(null);
            this.emit('close'); // otherwise this will still be called
        }
        else {
            this.push(text);
            written = written + text.length;
        }
        done();
    });
}
exports.default = offWriteStream;
