"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const through = require('through2');
const nodes = require("../nodes");
// reads a colored .off file and and writes out ast nodes
function offStream(delimiter = '\r\n') {
    let vertex_count;
    let face_count;
    let vertexCreator = nodes.vertex;
    let buffer = ''; // incomplete rest
    let vertex_lines_read = 0;
    return through({ objectMode: true }, function (chunk, enc, done) {
        const text = buffer + chunk.toString(enc);
        const lines = text.split(delimiter);
        buffer = '';
        let data_lines = lines;
        // header not read
        if (vertex_count === undefined) {
            const [format, meta] = lines;
            if (format === 'COFF') {
                vertexCreator = nodes.coloredVertex;
            }
            this.push(nodes.format(format));
            [vertex_count, face_count] = meta.split(' ').map(n => +n);
            this.push(nodes.meta(vertex_count, face_count));
            data_lines = lines.slice(2);
        }
        for (let i = 0; i < data_lines.length; ++i) {
            const line = data_lines[i];
            if (i === data_lines.length - 1) {
                // last line. no way to verify that a line ending with 18
                // is the hole color value or is part of '187'
                buffer = line;
                break;
            }
            else if (vertex_lines_read < vertex_count) {
                const [x, y, z, r, g, b] = line.split(' ').map(n => +n);
                this.push(vertexCreator(x, y, z, r, g, b));
                ++vertex_lines_read;
            }
            else {
                const [, ...vertices] = line.split(' ').map(n => +n);
                this.push(nodes.face(vertices[0], vertices[1], vertices[2]));
            }
        }
        done();
    });
}
exports.default = offStream;
