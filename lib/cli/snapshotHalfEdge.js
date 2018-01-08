"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable: no-console */
const argparse_1 = require("argparse");
const path = require("path");
const fs = require("fs");
const loadRegular_1 = require("../cluster/ooc/loadRegular");
const faceMeshToHalfEdge_1 = require("../mesh/faceMeshToHalfEdge");
const parser = new argparse_1.ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: 'creates an half edge snapshot for inspection with a debugger'
});
parser.addArgument(['-f', '--file'], {
    help: 'path to ooc cluster file',
    required: true
});
const args = parser.parseArgs();
const cluster_filename = path.join(process.cwd(), args.file);
loadRegular_1.default(cluster_filename)
    .then(cluster => {
    console.time('load_adjacent');
    const face_mesh = cluster.toMesh();
    console.timeEnd('load_adjacent');
    fs.writeFileSync('mesh.json', JSON.stringify(face_mesh, null, 2));
    console.time('conversion');
    const half_edge_mesh = faceMeshToHalfEdge_1.default(face_mesh);
    // tslint:disable-next-line: no-unused-variable
    const manifold_edges = half_edge_mesh.edges.filter(e => e.manifold);
    // tslint:disable-next-line: no-unused-variable
    const boundary_edges = half_edge_mesh.edges.filter(e => e.boundary);
    console.timeEnd('conversion');
})
    .then(() => {
    console.log('finished');
});
