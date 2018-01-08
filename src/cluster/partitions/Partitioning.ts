import { ClusterId, ClusterPosition } from '../Cluster';

export interface Partitioning {
  cluster(p: Vector): ClusterId;
  clusters(): IterableIterator<ClusterPosition>;
}
