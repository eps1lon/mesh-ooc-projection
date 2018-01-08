import { Readable } from 'stream';

import { Bbox } from '../math/bbox';
import { Vertex as VertexNode } from './nodes';
import vertexStream from './streams/vertex';

export interface Vertex {
  x: number;
  y: number;
  z: number;
}

export type Bbox = Bbox;

export default function bbox(off_read_stream: Readable): Promise<Bbox> {
  return new Promise((resolve, reject) => {
    let [x_min, y_min, z_min, x_max, y_max, z_max] = [
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY
    ];

    off_read_stream
      .pipe(vertexStream())
      .on('data', ({ x, y, z }: VertexNode) => {
        x_min = Math.min(x_min, x);
        y_min = Math.min(y_min, y);
        z_min = Math.min(z_min, z);
        x_max = Math.max(x_max, x);
        y_max = Math.max(y_max, y);
        z_max = Math.max(z_max, z);
      })
      .on('error', (err: Error) => reject(err))
      .on('end', () =>
        resolve({
          min: [x_min, y_min, z_min],
          max: [x_max, y_max, z_max]
        })
      );
  });
}
