/// <reference types="@types/node" />
/// <reference types="@types/jest" />
import * as path from 'path';

import { loadWithAdjacent } from '../ooc/loadRegular';

it('reindex to local indices', async () => {
  const cluster = await loadWithAdjacent(
    path.join(__dirname, '../ooc/__tests__/__fixtures__/x0y0z0')
  );
  const mesh = cluster.toMesh();

  expect(mesh.vertices.map(({ p }) => p)).toEqual([
    [11.89073, 65.10273, -17.58224],
    [12.06652, 65.03671, -17.40788],
    [12.03149, 65.00916, -17.80433],
    [11.70793, 64.84092, -17.86588],
    [11.8319, 64.72575, -17.39043]
  ]);

  expect(mesh.faces).toEqual([
    { vertices: [0, 1, 2], adjacent_clusters: ['x0y0z1'] },
    { vertices: [0, 3, 4], adjacent_clusters: ['x0y0z1'] },
    { vertices: [4, 1, 0], adjacent_clusters: ['x0y0z1'] },
    { vertices: [2, 3, 0], adjacent_clusters: ['x0y0z1'] }
  ]);
});
