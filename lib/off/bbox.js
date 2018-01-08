"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vertex_1 = require("./streams/vertex");
function bbox(off_read_stream) {
    return new Promise((resolve, reject) => {
        let [x_min, y_min, z_min, x_max, y_max, z_max] = [
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY
        ];
        off_read_stream
            .pipe(vertex_1.default())
            .on('data', ({ x, y, z }) => {
            x_min = Math.min(x_min, x);
            y_min = Math.min(y_min, y);
            z_min = Math.min(z_min, z);
            x_max = Math.max(x_max, x);
            y_max = Math.max(y_max, y);
            z_max = Math.max(z_max, z);
        })
            .on('error', (err) => reject(err))
            .on('end', () => resolve({
            min: [x_min, y_min, z_min],
            max: [x_max, y_max, z_max]
        }));
    });
}
exports.default = bbox;
