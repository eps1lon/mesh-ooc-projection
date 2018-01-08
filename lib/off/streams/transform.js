"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const through = require('through2');
/**
 * supports only vertex and format
 */
function transform(transformers) {
    const { format, vertex } = transformers;
    return through({ objectMode: true }, function (node, enc, done) {
        switch (node.type) {
            case 'vertex':
                this.push(vertex(node));
                break;
            case 'format':
                this.push(format(node));
                break;
            default:
                this.push(node);
                break;
        }
        done();
    });
}
exports.default = transform;
