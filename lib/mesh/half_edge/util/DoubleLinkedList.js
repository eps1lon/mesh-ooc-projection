"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param array
 * @return array_like with list[i].prev = list[i-1]
 */
function doubleLink(array) {
    for (let i = 1; i < array.length; ++i) {
        array[i].prev = array[i - 1];
        array[i - 1].next = array[i];
    }
    // close circle
    array[0].prev = array[array.length - 1];
    array[array.length - 1].next = array[0];
    return array;
}
exports.doubleLink = doubleLink;
