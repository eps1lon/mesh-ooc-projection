/* tslint:disable: no-console */
import { ArgumentParser } from 'argparse';
import * as path from 'path';

import createRegular from '../cluster/ooc/createRegular';
import readOffMesh from '../off/readMesh';
import { load as loadIndices, write as writeIndices } from '../segmentation';
import oocProjection from '../projection/oocProjection';

const parser = new ArgumentParser({
  version: '1.0.0',
  addHelp: true,
  description:
    'Projects color and segment indices of a low resolution mesh \
    to a high resolutin mesh using an out-of-core data structure. \
    The projected segment indices will be saved in the same directory \
    as the low resolution indices suffixed with .out.'
});

parser.addArgument(['--low-poly-file'], {
  help: 'path to low poly .off file',
  required: true
});
parser.addArgument(['--high-poly-file'], {
  help: 'path to high poly .off file',
  required: true
});
parser.addArgument(['--grid-resolution-max'], {
  help: 'max number of clusters along longest axis',
  required: true,
  type: 'int'
});
parser.addArgument(['--ooc-dir'], {
  help: 'path to directory where ooc files should reside',
  required: true
});
parser.addArgument(['--indices-file'], {
  help: 'path to low res indices file',
  required: true
});

const args = parser.parseArgs();

const low_res_file = path.join(process.cwd(), args.low_poly_file);
const high_res_file = path.join(process.cwd(), args.high_poly_file);
const low_res_indices_file = path.join(process.cwd(), args.indices_file);
const high_poly_indices_file = low_res_indices_file + '.out';
const ooc_dir = path.join(process.cwd(), args.ooc_dir);
const grid_res = args.grid_resolution_max;

console.log('reading: low poly mesh and indices while creating ooc struct...');

console.time('main');
console.time('read_low_poly');
console.time('read_low_poly_indices');

Promise.all([
  readOffMesh(low_res_file).then(mesh => {
    console.timeEnd('read_low_poly');
    console.log(
      `read low poly ${mesh.vertices.length} vertices ${
        mesh.faces.length
      } faces`
    );

    return mesh;
  }),
  loadIndices(low_res_indices_file).then(indices => {
    console.timeEnd('read_low_poly_indices');
    console.log(`read ${indices.length} indices`);

    return indices;
  }),
  createRegular(high_res_file, ooc_dir, grid_res).then(clusters => {
    console.log(`created ooc structure`);
    return clusters;
  })
])
  .then(([mesh, low_res_indices, clusters]) => {
    console.log('done. starting to project...');

    return oocProjection(mesh, low_res_indices, clusters);
  })
  .then(high_poly_indices => {
    console.time('write_high_poly_indices');
    return writeIndices(high_poly_indices_file, high_poly_indices);
  })
  .then(() => {
    console.timeEnd('write_high_poly_indices');
    console.timeEnd('main');
    console.log('done');
  });
