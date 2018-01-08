/* tslint:disable: no-console */
import { ArgumentParser } from 'argparse';
import * as path from 'path';

import oocProjection from '../projection/oocProjection';
import readOffMesh from '../off/readMesh';
import RegularGrid from '../cluster/partitions/RegularGrid';
import OocClustersRegular from '../cluster/ooc/OocClustersRegular';
import { load as loadIndices, write as writeIndices } from '../segmentation';

const parser = new ArgumentParser({
  version: '1.0.0',
  addHelp: true,
  description:
    'Projects color and segment indices of a low resolution mesh \
  to a high resolutin mesh using a given out-of-core data structure.'
});

parser.addArgument(['-f', '--file'], {
  help: 'path to low res .off file',
  required: true
});
parser.addArgument(['-i', '--indices-file'], {
  help: 'path to low res indices file',
  required: true
});
parser.addArgument(['--high-poly-vertices'], {
  help: 'number of vertices in high poly',
  required: true
});
parser.addArgument(['-r', '--res'], {
  help: 'number of clusters along longest axis',
  required: true,
  type: 'int'
});
parser.addArgument(['-o', '--ooc-dir'], {
  help: 'path to directory with ooc files ',
  required: true
});

const args = parser.parseArgs();

const low_res_file = path.join(process.cwd(), args.file);
const low_res_indices_file = path.join(process.cwd(), args.indices_file);
const high_poly_indices_file = low_res_indices_file + '.out';
const ooc_dir = path.join(process.cwd(), args.ooc_dir);

console.time('read_low_poly');
Promise.all([readOffMesh(low_res_file), loadIndices(low_res_indices_file)])
  .then(async ([mesh, low_res_indices]) => {
    console.timeEnd('read_low_poly');

    const bbox = mesh.computeBbox();
    const partitioning = new RegularGrid(bbox, args.res);
    const clusters = new OocClustersRegular(
      ooc_dir,
      partitioning,
      args.high_poly_vertices
    );

    return oocProjection(mesh, low_res_indices, clusters);
  })
  .then(high_poly_indices => {
    return writeIndices(high_poly_indices_file, high_poly_indices);
  })
  .then(() => {
    console.log('done');
  });
