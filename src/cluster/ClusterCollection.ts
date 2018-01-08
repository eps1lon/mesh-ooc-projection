import Cluster, { ClusterId, LocalFace, LocalVertex } from './Cluster';
import { Bbox } from '../off/bbox';

export interface ClusterCollection<V extends LocalVertex, F extends LocalFace> {
  num_vertices: number;
  allClusters(): Iterable<ClusterId>;
  // clusters in bbox
  bboxClusters(bbox: Bbox): Iterable<ClusterId>;
  clusterFor(p: Vector): ClusterId;
  getCluster(id: ClusterId): Promise<Cluster<V, F>>;
  getAdjacent(cluster: Cluster<V, F>): Promise<Array<Cluster<V, F>>>;
}
