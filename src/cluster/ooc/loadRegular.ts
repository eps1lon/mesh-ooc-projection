/* tslint:disable: no-console */
import * as path from 'path';

import { GlobalVertexId } from '../../cluster/Cluster';
import { readFile } from '../../util/fs';
import OocCluster, { FileFlags, DiskFace, DiskVertex } from './OocCluster';

/**
 * @param {string} filename
 * @param {boolean} vertex_geometry load so that every triangle incident
 *                  in the contained vertices are loaded
 * @param {boolean} root don't set this value. it's used to determine what
 *                  parts of the cluster are writeable
 */
export default async function loadRegular(
  filepath: string
): Promise<OocCluster> {
  const file = (await readFile(filepath)).toString('utf8');

  const vertex_flags = FileFlags.read_write;

  const vertices: DiskVertex[] = [];
  const faces: DiskFace[] = [];

  // O(v+f)
  for (const line of file.split('\n')) {
    if (isVertex(line)) {
      vertices.push({ ...readVertex(line), flags: vertex_flags });
    } else if (isFace(line)) {
      faces.push(readFace(line));
    }
  }

  // => O(v + f)
  return new OocCluster(vertices, faces, path.basename(filepath));
}

export async function loadWithAdjacent(filepath: string): Promise<OocCluster> {
  const dir = path.dirname(filepath);
  const root = await loadRegular(filepath);

  const needed_vertices = new Set(
    root.partialFaces().reduce(
      (vertices, face) => {
        vertices.push(...face.vertices);
        return vertices;
      },
      [] as GlobalVertexId[]
    )
  );

  await Promise.all(
    [...root.adjacent].map(async adjacent_id => {
      const adjacent = await loadRegular(path.join(dir, adjacent_id));

      root.vertices.push(
        ...adjacent.vertices
          .filter(({ vertex_id }) => needed_vertices.has(vertex_id))
          .map(vertex => {
            return {
              ...vertex,
              flags: FileFlags.read
            };
          })
      );

      root.adjacent_included.add(adjacent_id);

      return;
    })
  );

  return root;
}

function isVertex(line: string): boolean {
  return line.split(' ').length === 9;
}

function readVertex(line: string): DiskVertex {
  const [
    vertex_id,
    x,
    y,
    z,
    r,
    g,
    b,
    segment_index,
    projected_heuristic
  ] = line.split(' ');

  const color: [number, number, number] | undefined =
    r !== '' && b !== '' && b !== '' ? [+r, +g, +b] : undefined;

  return {
    flags: FileFlags.read,
    vertex_id: +vertex_id,
    p: [+x, +y, +z],
    attributes: {
      color,
      segment: segment_index === '' ? undefined : +segment_index,
      projected_heuristic:
        projected_heuristic === ''
          ? Number.POSITIVE_INFINITY
          : +projected_heuristic
    }
  };
}

function isFace(line: string): boolean {
  const adjacent = line.split(' ')[4];

  return Boolean(
    typeof adjacent === 'string' &&
      (adjacent === '' || adjacent.startsWith('x'))
  );
}

function readFace(line: string): DiskFace {
  const [, vertex_a, vertex_b, vertex_c, adjacent_clusters] = line.split(' ');

  return {
    vertices: [+vertex_a, +vertex_b, +vertex_c],
    adjacent_clusters:
      // avoid ''.split() => ['']
      adjacent_clusters.length > 0 ? adjacent_clusters.split(',') : []
  };
}
