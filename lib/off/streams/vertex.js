"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const through = require('through2');
// filter off stream output by type
// in: Node[], out: Vertex[]
function offVertexStream() {
    return through({ objectMode: true }, function (node, enc, done) {
        if (node.type === 'vertex') {
            this.push(node);
        }
        else if (node.type === 'face') {
            // truncate
            this.push(null);
        }
        done();
    });
}
exports.default = offVertexStream;
