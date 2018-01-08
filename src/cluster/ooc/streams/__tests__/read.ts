/// <reference types="@types/node" />
/// <reference types="@types/jest" />
import * as path from 'path';

import ReadableClusters, { Out } from '../ReadableClusters';
import RegularGrid from '../../../partitions/RegularGrid';
import { vertex as vertexNode } from '../../../../off/nodes';

const grid = new RegularGrid({ min: [0, 0, 0], max: [5, 5, 5] }, 5);

it('should output one regular cluster at a time', done => {
  const readable = new ReadableClusters(
    path.join(__dirname, '__fixtures__'),
    grid
  );

  readable.once('readable', () => {
    const first: Out = readable.read();

    expect(first).not.toBe(null);
    expect(first.partialFaces()).toHaveLength(4);
    expect(first.vertices).toHaveLength(5);

    expect(
      // every vertex of each contained face should be present
      first
        .completeFaces()
        .every(face =>
          face.vertices.every(
            vertex =>
              first.vertices.find(({ vertex_id }) => vertex_id === vertex) !==
              undefined
          )
        )
    );

    readable.once('end', () => done());
    // drain
    readable.on('data', () => undefined);
  });
});

it('should ignore non existing clusters', done => {
  const readable = new ReadableClusters(
    path.join(__dirname, '__fixtures__'),
    grid
  );
  const clusters: any[] = [];

  readable.once('end', () => {
    expect(clusters).toHaveLength(2);

    done();
  });

  readable.on('data', (cluster: any) => clusters.push(cluster));
});

it('should end sometime', done => {
  const readable = new ReadableClusters(
    path.join(__dirname, '__fixtures__'),
    grid
  );
  readable.once('end', () => {
    expect(readable.read()).toBe(null);
    done();
  });

  // just drain
  readable.on('data', () => {
    return;
  });
});
