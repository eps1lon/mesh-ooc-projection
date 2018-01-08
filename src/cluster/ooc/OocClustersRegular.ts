import * as path from 'path';

import { ClusterId } from '../Cluster';
import { ClusterCollection } from '../ClusterCollection';
import OocCluster, { DiskVertex, DiskFace } from './OocCluster';
import RegularGrid from '../partitions/RegularGrid';
import loadRegular from './loadRegular';
import ReadRegular from './streams/ReadableClusters';
import { Bbox } from '../../off/bbox';

export default class OocClustersRegular
  implements ClusterCollection<DiskVertex, DiskFace> {
  public dir: string;
  public grid: RegularGrid;
  public num_vertices: number;
  private stream: ReadRegular;

  constructor(dir: string, grid: RegularGrid, num_vertices: number) {
    this.dir = dir;
    this.grid = grid;

    this.stream = new ReadRegular(this.dir, this.grid);
    // init "unknown"
    this.num_vertices = num_vertices;
  }

  public allClusters() {
    return this.stream.existingClusters();
  }

  public bboxClusters(bbox: Bbox) {
    // throw would would not satisfy interface impl
    // throw and return gives unreachable code detected
    /* tslint:disable-next-line: no-console */
    console.error('not implemented');
    return [];
  }

  public clusterFor(p: Vector) {
    return this.grid.cluster(p);
  }

  public getCluster(id: ClusterId) {
    return loadRegular(path.join(this.dir, id));
  }

  public getAdjacent(cluster: OocCluster) {
    return Promise.all(
      [...cluster.adjacent].map(adjacent_id => this.getCluster(adjacent_id))
    );
  }
}
