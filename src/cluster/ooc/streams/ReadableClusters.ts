import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

import OocCluster from '../OocCluster';
import { loadWithAdjacent } from '../loadRegular';
import RegularGrid from '../../partitions/RegularGrid';
import { ClusterId } from '../../Cluster';

// read of this stream
export type Out = OocCluster;
/**
 * creates a readable stream which outputs one regular cluster at a time
 */
export default class ReadRegular extends Readable {
  public readonly dir: string;
  public readonly grid: RegularGrid;
  private cluster_ids: IterableIterator<string>;

  constructor(dir: string, grid: RegularGrid) {
    super({ objectMode: true });

    this.dir = dir;
    this.grid = grid;

    this.reset();
  }

  public reset() {
    this.cluster_ids = this.existingClusters();

    this.emit('readable');
  }

  public *existingClusters(): IterableIterator<ClusterId> {
    for (const cluster of this.grid.clusters()) {
      const cluster_id = RegularGrid.clusterId(cluster);
      const cluster_file = path.join(this.dir, cluster_id);

      if (fs.existsSync(cluster_file)) {
        yield cluster_id;
      }
    }
  }

  public _read() {
    const { done, value: cluster_id } = this.cluster_ids.next();

    if (done) {
      this.push(null);
    } else {
      loadWithAdjacent(path.join(this.dir, cluster_id)).then(
        ({ faces, name, vertices }) => {
          const out: Out = new OocCluster(vertices, faces, name);
          this.push(out);
        }
      );
    }
  }
}
