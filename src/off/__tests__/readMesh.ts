/// <reference types="@types/node" />
/// <reference types="@types/jest" />
import * as path from 'path';

import readMesh from '../readMesh';

it('should read the mesh', async () => {
  const mesh = await readMesh(path.join(__dirname, './mesh.off'), {
    delimiter: '\n'
  });

  expect(mesh.vertices).toHaveLength(4);
  expect(mesh.faces).toHaveLength(2);
  // every face has valid vertex indices
  expect(
    mesh.faces.every(face =>
      face.vertices.every(
        vertex_index => mesh.vertices[vertex_index] !== undefined
      )
    )
  );
});
