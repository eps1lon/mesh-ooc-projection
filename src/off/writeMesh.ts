import * as fs from 'fs';

import * as nodes from '../off/nodes';
import offWriteStream from '../off/streams/write';
import FaceMesh from '../mesh/FaceMesh';

export default async function writeMesh(mesh: FaceMesh, path: string) {
  return new Promise((resolve, reject) => {
    // FIXME offWriteStream().pipe(fswriteStream) throws
    const out_stream = fs.createWriteStream(path);
    out_stream.on('error', err => reject(err));

    const write_stream = offWriteStream().on('data', (data: string) =>
      out_stream.write(data)
    );

    write_stream.write(nodes.format('COFF'));
    write_stream.write(nodes.meta(mesh.vertices.length, mesh.faces.length, 0));

    mesh.vertices.forEach((vertex, i) => {
      const [x, y, z] = vertex.p;
      const { color } = vertex.attributes;
      if (color !== undefined) {
        write_stream.write(
          nodes.coloredVertex(x, y, z, color[0], color[1], color[2])
        );
      } else {
        write_stream.write(nodes.vertex(x, y, z));
      }
    });

    mesh.faces.forEach(({ vertices }) => {
      const [a, b, c] = vertices;
      write_stream.write(nodes.face(a, b, c));
    });

    write_stream.end(() => {
      resolve();
    });
  });
}
