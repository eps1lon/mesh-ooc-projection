"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable: no-console */
const argparse_1 = require("argparse");
const path = require("path");
const oocProjection_1 = require("../projection/oocProjection");
const readMesh_1 = require("../off/readMesh");
const RegularGrid_1 = require("../cluster/partitions/RegularGrid");
const OocClustersRegular_1 = require("../cluster/ooc/OocClustersRegular");
const segmentation_1 = require("../segmentation");
const parser = new argparse_1.ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: 'Projects color and segment indices of a low resolution mesh \
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
Promise.all([readMesh_1.default(low_res_file), segmentation_1.load(low_res_indices_file)])
    .then(async ([mesh, low_res_indices]) => {
    console.timeEnd('read_low_poly');
    const bbox = mesh.computeBbox();
    const partitioning = new RegularGrid_1.default(bbox, args.res);
    const clusters = new OocClustersRegular_1.default(ooc_dir, partitioning, args.high_poly_vertices);
    return oocProjection_1.default(mesh, low_res_indices, clusters);
})
    .then(high_poly_indices => {
    return segmentation_1.write(high_poly_indices_file, high_poly_indices);
})
    .then(() => {
    console.log('done');
});
