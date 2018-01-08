/* tslint:disable: no-console */
import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import { Readable } from 'stream';

import offFileReadStream from '../../off/streams/pipes/fileRead';
import getBbox, { Bbox } from '../../off/bbox';
import * as nodes from '../../off/nodes';
import { ClusterId } from '../Cluster';
import RegularGrid, { MeshType } from '../partitions/RegularGrid';
import { writeFace, writeVertex } from './writeRegular';
import OocClustersRegular from './OocClustersRegular';

// partitions a mesh into a regular grid
// each cluster is saved in an ascii file format
// file name describes coords in grid
// cluster format:
// [...vertex_lines, ...face_lines]
// vertex_line
// ${id} ${off format of vertex}
// face_line
// ${off format of face} ${(cluster_ids of vertices).join(',')}

export default function createRegular(
  file: string,
  out_dir: string,
  res: number
): Promise<OocClustersRegular> {
  console.time('bbox');

  return getBbox(offFileReadStream(file)).then(bbox => {
    console.timeEnd('bbox');

    return buildOoc(offFileReadStream(file), bbox, res, out_dir);
  });
}

/**
 * resolves with list of non empty clusters
 * @param {offReadStream} off_read_stream
 * @param {Object} bbox
 * @param {number} res
 */
function buildOoc(
  off_read_stream: Readable,
  bbox: Bbox,
  res: number,
  ooc_dir: string
): Promise<OocClustersRegular> {
  const grid = new RegularGrid(
    {
      min: [bbox.min[0], bbox.min[1], bbox.min[2]],
      max: [bbox.max[0], bbox.max[1], bbox.max[2]]
    },
    res,
    MeshType.SquareMax
  );
  console.log(grid.grid);

  // mapping from vertex_id to cluster_id
  const clusters: { [key: string]: ClusterId } = {};
  // open cluster file handles
  const files: { [key: string]: fs.WriteStream } = {};

  // current vertex index
  let vertex_id = 0;
  let face_id = 0;

  return new Promise((resolve, reject) => {
    off_read_stream
      .on('data', (node: nodes.Node) => {
        if (nodes.isVertex(node)) {
          if (vertex_id === 0) {
            console.time('vertex_pass');
          }

          const cluster_id = grid.cluster([node.x, node.y, node.z]);

          // get file handle
          let file = files[cluster_id];

          if (file === undefined) {
            file = files[cluster_id] = fs.createWriteStream(
              path.join(ooc_dir, cluster_id)
            );
          }

          clusters[vertex_id] = cluster_id;
          writeVertex(file, vertex_id, {
            p: [node.x, node.y, node.z],
            attributes: {
              color: nodes.isColoredVertex(node)
                ? [node.color.r, node.color.b, node.color.g]
                : undefined
            }
          });

          ++vertex_id;
        } else if (nodes.isFace(node)) {
          if (face_id === 0) {
            console.timeEnd('vertex_pass');
            console.time('face_pass');
          }

          // duplicate face into each cluster where it has a cluster
          _.uniq(node.vertices.map(vertex => clusters[vertex])).forEach(
            (cluster_id, i, clusters_of_face) =>
              writeFace(
                files[cluster_id],
                node,
                // deduplicate
                clusters_of_face.filter(
                  face_cluster_id => face_cluster_id !== cluster_id
                )
              )
          );

          ++face_id;
        }
      })
      .on('error', err => reject(err))
      .on('end', () => {
        console.timeEnd('face_pass');

        Promise.all(Object.values(files).map(endWritePromised)).then(() => {
          resolve(new OocClustersRegular(ooc_dir, grid, vertex_id));
        });
      });
  });
}

// returns a promise that resolves once the underlying stream is closed
function endWritePromised(stream: fs.WriteStream) {
  return new Promise(resolve => {
    stream.once('close', () => resolve());
    stream.end();
  });
}
