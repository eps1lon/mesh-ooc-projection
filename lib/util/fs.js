"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util_1 = require("util");
exports.readFile = util_1.promisify(fs.readFile);
exports.writeFile = util_1.promisify(fs.writeFile);
exports.readdir = util_1.promisify(fs.readdir);
