"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cluster_1 = require("../Cluster");
var FileFlags;
(function (FileFlags) {
    FileFlags[FileFlags["read"] = 0] = "read";
    FileFlags[FileFlags["read_write"] = 1] = "read_write";
})(FileFlags = exports.FileFlags || (exports.FileFlags = {}));
class OocCluster extends Cluster_1.default {
    saveAttribute(attributes, getAttribute) {
        for (const vertex of this.vertices) {
            attributes[vertex.vertex_id] = getAttribute(vertex);
        }
    }
}
exports.default = OocCluster;
