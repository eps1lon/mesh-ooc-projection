import Cluster, { LocalFace, LocalVertex } from '../Cluster';

export enum FileFlags {
  read,
  read_write
}

export type DiskFace = LocalFace;

export interface DiskVertex extends LocalVertex {
  flags: FileFlags;
}

export default class OocCluster extends Cluster<DiskVertex, DiskFace> {
  public saveAttribute(
    attributes: Int32Array,
    getAttribute: (vertex: DiskVertex) => number
  ) {
    for (const vertex of this.vertices) {
      attributes[vertex.vertex_id] = getAttribute(vertex);
    }
  }
}
