"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createProgress(total) {
    let cur = 1;
    return () => process.stdout.write(`\r${cur++} / ${total}`);
}
exports.createProgress = createProgress;
