"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const stream_1 = require("stream");
const OocCluster_1 = require("../OocCluster");
const loadRegular_1 = require("../loadRegular");
const RegularGrid_1 = require("../../partitions/RegularGrid");
/**
 * creates a readable stream which outputs one regular cluster at a time
 */
class ReadRegular extends stream_1.Readable {
    constructor(dir, grid) {
        super({ objectMode: true });
        this.dir = dir;
        this.grid = grid;
        this.reset();
    }
    reset() {
        this.cluster_ids = this.existingClusters();
        this.emit('readable');
    }
    *existingClusters() {
        for (const cluster of this.grid.clusters()) {
            const cluster_id = RegularGrid_1.default.clusterId(cluster);
            const cluster_file = path.join(this.dir, cluster_id);
            if (fs.existsSync(cluster_file)) {
                yield cluster_id;
            }
        }
    }
    _read() {
        const { done, value: cluster_id } = this.cluster_ids.next();
        if (done) {
            this.push(null);
        }
        else {
            loadRegular_1.loadWithAdjacent(path.join(this.dir, cluster_id)).then(({ faces, name, vertices }) => {
                const out = new OocCluster_1.default(vertices, faces, name);
                this.push(out);
            });
        }
    }
}
exports.default = ReadRegular;
