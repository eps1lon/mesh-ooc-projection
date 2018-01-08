"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 1d euclidian distance
const d = (a, b) => Math.abs(b - a);
var MeshType;
(function (MeshType) {
    MeshType[MeshType["SquareMin"] = 0] = "SquareMin";
    MeshType[MeshType["SquareMax"] = 1] = "SquareMax"; // every cluster is a square, guarentees max {res} clusters in any direction
})(MeshType = exports.MeshType || (exports.MeshType = {}));
class RegularGrid {
    static clusterId(cluster) {
        return `x${cluster[0]}y${cluster[1]}z${cluster[2]}`;
    }
    static buildMesh(bbox, res, type) {
        switch (type) {
            case MeshType.SquareMin:
                return RegularGrid.buildSquareGrid(bbox, res, Math.min);
            case MeshType.SquareMax:
                return RegularGrid.buildSquareGrid(bbox, res, Math.max);
        }
    }
    // builds a mesh with a res
    static buildSquareGrid(bbox, res, chooseExtent = Math.min) {
        const measures = {
            x: Math.abs(bbox.max[0] - bbox.min[0]),
            y: Math.abs(bbox.max[1] - bbox.min[1]),
            z: Math.abs(bbox.max[2] - bbox.min[2])
        };
        const extent = chooseExtent(...Object.values(measures));
        const cluster_extent = extent / res;
        // number of cells in [x,y,z]
        return [
            Math.ceil(measures.x / cluster_extent),
            Math.ceil(measures.y / cluster_extent),
            Math.ceil(measures.z / cluster_extent)
        ];
    }
    constructor(bbox, res, mesh_type = MeshType.SquareMax) {
        this.bbox = bbox;
        this.grid = RegularGrid.buildMesh(bbox, res, mesh_type);
    }
    cluster(vertex) {
        const { min, max } = this.bbox;
        return RegularGrid.clusterId(vertex.reduce((cluster, _, dimension) => {
            const grid = d(min[dimension], max[dimension]) / this.grid[dimension];
            const cluster_dimension = Math.floor((vertex[dimension] - min[dimension]) / grid);
            cluster[dimension] = cluster_dimension;
            return cluster;
        }, {}));
    }
    // iterate over cluster_ids
    *clusters() {
        // each row, col, depth
        for (let x = 0; x <= this.grid[0]; ++x) {
            for (let y = 0; y <= this.grid[1]; ++y) {
                for (let z = 0; z <= this.grid[2]; ++z) {
                    yield [x, y, z];
                }
            }
        }
    }
    clusterBbox(pos) {
        const res_x = (this.bbox.max[0] - this.bbox.min[0]) / this.grid[0];
        const res_y = (this.bbox.max[1] - this.bbox.min[1]) / this.grid[1];
        const res_z = (this.bbox.max[2] - this.bbox.min[2]) / this.grid[2];
        const min = [
            this.bbox.min[0] + pos[0] * res_x,
            this.bbox.min[1] + pos[1] * res_y,
            this.bbox.min[2] + pos[2] * res_z
        ];
        const max = [
            this.bbox.min[0] + (pos[0] + 1) * res_x,
            this.bbox.min[1] + (pos[0] + 1) * res_y,
            this.bbox.min[2] + (pos[0] + 1) * res_z
        ];
        return { min, max };
    }
}
exports.default = RegularGrid;
