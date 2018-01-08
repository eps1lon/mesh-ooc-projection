/// <reference types="@types/node" />
/// <reference types="@types/jest" />
import * as path from 'path';

import { FileFlags } from '../OocCluster';
import loadRegular, { loadWithAdjacent } from '../loadRegular';

it('should load the cluster with global ids', async () => {
  const cluster = await loadRegular(
    path.join(__dirname, '__fixtures__/x0y0z0')
  );

  expect(cluster.vertices).toEqual([
    {
      flags: FileFlags.read_write,
      attributes: {
        color: undefined,
        projected_heuristic: Number.POSITIVE_INFINITY,
        segment: undefined
      },
      p: [11.89073, 65.10273, -17.58224],
      vertex_id: 1702
    }
  ]);

  expect(cluster.completeFaces()).toEqual([]);
});

it('should include full geometry', async () => {
  const cluster = await loadWithAdjacent(
    path.join(__dirname, '__fixtures__/x0y0z0')
  );

  expect(cluster.vertices).toEqual([
    {
      flags: FileFlags.read_write,
      attributes: {
        color: undefined,
        projected_heuristic: Number.POSITIVE_INFINITY,
        segment: undefined
      },
      p: [11.89073, 65.10273, -17.58224],
      vertex_id: 1702
    },
    {
      flags: FileFlags.read,

      attributes: {
        color: undefined,
        projected_heuristic: Number.POSITIVE_INFINITY,
        segment: undefined
      },
      p: [12.06652, 65.03671, -17.40788],
      vertex_id: 1703
    },
    {
      flags: FileFlags.read,

      attributes: {
        color: undefined,
        projected_heuristic: Number.POSITIVE_INFINITY,
        segment: undefined
      },
      p: [12.03149, 65.00916, -17.80433],
      vertex_id: 1739
    },
    {
      flags: FileFlags.read,

      attributes: {
        color: undefined,
        projected_heuristic: Number.POSITIVE_INFINITY,
        segment: undefined
      },
      p: [11.70793, 64.84092, -17.86588],
      vertex_id: 1740
    },
    {
      flags: FileFlags.read,
      attributes: {
        color: undefined,
        projected_heuristic: Number.POSITIVE_INFINITY,
        segment: undefined
      },
      p: [11.8319, 64.72575, -17.39043],
      vertex_id: 1756
    }
  ]);

  expect(cluster.completeFaces()).toEqual([
    {
      adjacent_clusters: ['x0y0z1'],
      vertices: [1702, 1703, 1739]
    },
    {
      adjacent_clusters: ['x0y0z1'],
      vertices: [1702, 1740, 1756]
    },
    {
      adjacent_clusters: ['x0y0z1'],
      vertices: [1756, 1703, 1702]
    },
    {
      adjacent_clusters: ['x0y0z1'],
      vertices: [1739, 1740, 1702]
    }
  ]);
});
