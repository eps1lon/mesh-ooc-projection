"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const loadRegular_1 = require("./loadRegular");
const ReadableClusters_1 = require("./streams/ReadableClusters");
class OocClustersRegular {
    constructor(dir, grid, num_vertices) {
        this.dir = dir;
        this.grid = grid;
        this.stream = new ReadableClusters_1.default(this.dir, this.grid);
        // init "unknown"
        this.num_vertices = num_vertices;
    }
    allClusters() {
        return this.stream.existingClusters();
    }
    bboxClusters(bbox) {
        // throw would would not satisfy interface impl
        // throw and return gives unreachable code detected
        /* tslint:disable-next-line: no-console */
        console.error('not implemented');
        return [];
    }
    clusterFor(p) {
        return this.grid.cluster(p);
    }
    getCluster(id) {
        return loadRegular_1.default(path.join(this.dir, id));
    }
    getAdjacent(cluster) {
        return Promise.all([...cluster.adjacent].map(adjacent_id => this.getCluster(adjacent_id)));
    }
}
exports.default = OocClustersRegular;
