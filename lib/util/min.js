"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// python styled min
function min(items, value) {
    let min_item;
    let min_value = Number.POSITIVE_INFINITY;
    for (const item of items) {
        const cur_value = value(item);
        if (cur_value < min_value || min_item === undefined) {
            min_value = cur_value;
            min_item = item;
        }
    }
    if (min_item === undefined) {
        throw new Error('iterator was empty');
    }
    return min_item;
}
exports.default = min;
