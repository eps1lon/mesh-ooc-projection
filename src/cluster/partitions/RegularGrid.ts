import { Bbox } from '../../math/bbox';
import { ClusterPosition, ClusterId } from '../Cluster';
import { Partitioning } from './Partitioning';

export type Grid = [number, number, number];

// 1d euclidian distance
const d = (a: number, b: number) => Math.abs(b - a);

export enum MeshType {
  SquareMin, // every cluster is a square, guarentees {res} clusters in every direction
  SquareMax // every cluster is a square, guarentees max {res} clusters in any direction
}

export default class RegularGrid implements Partitioning {
  public static clusterId(cluster: ClusterPosition): string {
    return `x${cluster[0]}y${cluster[1]}z${cluster[2]}`;
  }

  public static buildMesh(bbox: Bbox, res: number, type: MeshType) {
    switch (type) {
      case MeshType.SquareMin:
        return RegularGrid.buildSquareGrid(bbox, res, Math.min);
      case MeshType.SquareMax:
        return RegularGrid.buildSquareGrid(bbox, res, Math.max);
    }
  }

  // builds a mesh with a res
  public static buildSquareGrid(
    bbox: Bbox,
    res: number,
    chooseExtent: (...extents: number[]) => number = Math.min
  ): Grid {
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

  public readonly bbox: Bbox;
  public readonly grid: Grid;

  constructor(
    bbox: Bbox,
    res: number,
    mesh_type: MeshType = MeshType.SquareMax
  ) {
    this.bbox = bbox;
    this.grid = RegularGrid.buildMesh(bbox, res, mesh_type);
  }

  public cluster(vertex: Vector): ClusterId {
    const { min, max } = this.bbox;

    return RegularGrid.clusterId(
      vertex.reduce(
        (cluster, _, dimension) => {
          const grid = d(min[dimension], max[dimension]) / this.grid[dimension];
          const cluster_dimension = Math.floor(
            (vertex[dimension] - min[dimension]) / grid
          );

          cluster[dimension] = cluster_dimension;

          return cluster;
        },
        {} as ClusterPosition
      )
    );
  }

  // iterate over cluster_ids
  public *clusters(): IterableIterator<ClusterPosition> {
    // each row, col, depth
    for (let x = 0; x <= this.grid[0]; ++x) {
      for (let y = 0; y <= this.grid[1]; ++y) {
        for (let z = 0; z <= this.grid[2]; ++z) {
          yield [x, y, z];
        }
      }
    }
  }

  public clusterBbox(pos: ClusterPosition): Bbox {
    const res_x = (this.bbox.max[0] - this.bbox.min[0]) / this.grid[0];
    const res_y = (this.bbox.max[1] - this.bbox.min[1]) / this.grid[1];
    const res_z = (this.bbox.max[2] - this.bbox.min[2]) / this.grid[2];

    const min: Vector = [
      this.bbox.min[0] + pos[0] * res_x,
      this.bbox.min[1] + pos[1] * res_y,
      this.bbox.min[2] + pos[2] * res_z
    ];
    const max: Vector = [
      this.bbox.min[0] + (pos[0] + 1) * res_x,
      this.bbox.min[1] + (pos[0] + 1) * res_y,
      this.bbox.min[2] + (pos[0] + 1) * res_z
    ];

    return { min, max };
  }
}
