/* tslint:disable: no-console */
import { ArgumentParser } from 'argparse';
import * as path from 'path';
import * as fs from 'fs';

import loadRegular from '../cluster/ooc/loadRegular';
import faceMeshToHalfEdge from '../mesh/faceMeshToHalfEdge';

const parser = new ArgumentParser({
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

loadRegular(cluster_filename)
  .then(cluster => {
    console.time('load_adjacent');
    const face_mesh = cluster.toMesh();
    console.timeEnd('load_adjacent');

    fs.writeFileSync('mesh.json', JSON.stringify(face_mesh, null, 2));

    console.time('conversion');
    const half_edge_mesh = faceMeshToHalfEdge(face_mesh);
    // tslint:disable-next-line: no-unused-variable
    const manifold_edges = half_edge_mesh.edges.filter(e => e.manifold);
    // tslint:disable-next-line: no-unused-variable
    const boundary_edges = half_edge_mesh.edges.filter(e => e.boundary);
    console.timeEnd('conversion');
  })
  .then(() => {
    console.log('finished');
  });
