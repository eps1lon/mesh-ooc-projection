import { createWriteStream, WriteStream } from 'fs';
import * as path from 'path';

import { ClusterId } from '../Cluster';
import { Vertex } from '../../mesh/FaceMesh';
import * as nodes from '../../off/nodes';
import nodesToText from '../../off/nodesToText';
import OocCluster, { FileFlags } from './OocCluster';

export function writeBack(cluster: OocCluster, dir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(path.join(dir, cluster.name));
    file.on('error', err => reject(err));

    writeVertices(cluster, file);
    writeFaces(cluster, file);

    file.end(() => resolve());
  });
}

function writeVertices(cluster: OocCluster, file: WriteStream): void {
  cluster.vertices.forEach(vertex => {
    if (vertex.flags === FileFlags.read_write) {
      writeVertex(file, vertex.vertex_id, vertex);
    }
  });
}

export function writeVertex(
  file: WriteStream,
  vertex_id: number,
  vertex: Vertex
) {
  // will be read as undefined
  const empty_string = '';

  const line: Array<string | number> = [
    vertex.p[0].toString(),
    vertex.p[1].toString(),
    vertex.p[2].toString()
  ];

  if (vertex.attributes.color !== undefined) {
    line.push(...vertex.attributes.color);
  } else {
    line.push(...[empty_string, empty_string, empty_string]);
  }

  if (vertex.attributes.segment !== undefined) {
    line.push(vertex.attributes.segment);
  } else {
    line.push(empty_string);
  }

  if (
    vertex.attributes.projected_heuristic !== undefined &&
    vertex.attributes.projected_heuristic !== Number.POSITIVE_INFINITY
  ) {
    line.push(asciiNum(vertex.attributes.projected_heuristic));
  } else {
    line.push(empty_string);
  }

  file.write(`${vertex_id} ${line.join(' ')}\n`);
}

function writeFaces(cluster: OocCluster, file: WriteStream): void {
  cluster.writeableFaces().forEach(face => {
    writeFace(
      file,
      nodes.face(face.vertices[0], face.vertices[1], face.vertices[2]),
      face.adjacent_clusters
    );
  });
}

export function writeFace(
  file: WriteStream,
  face: nodes.Face,
  clusters_of_face: ClusterId[]
) {
  file.write(`${nodesToText(face)} ${clusters_of_face}\n`);
}

// float to string for ascii file formats
function asciiNum(n: number): number {
  // to fixed adds trailing zeros, converting trailing zeros to num removes them
  return +n.toFixed(4);
}
