import { Transform } from 'stream';
const through = require('through2');

import { Format, ColoredVertex, Vertex, Node } from '../nodes';

export type Transformer<T extends Node> = (node: T) => T;
export interface Transformers {
  // optional results in error
  // https://stackoverflow.com/questions/43662729/union-type-of-two-functions-in-typescript
  format: Transformer<Format>;
  vertex: Transformer<Vertex | ColoredVertex>;
}
/**
 * supports only vertex and format
 */
export default function transform(transformers: Transformers) {
  const { format, vertex } = transformers;

  return through({ objectMode: true }, function(
    this: Transform,
    node: Node,
    enc: string,
    done: () => void
  ) {
    switch (node.type) {
      case 'vertex':
        this.push(vertex(node));
        break;
      case 'format':
        this.push(format(node));
        break;
      default:
        this.push(node);
        break;
    }

    done();
  });
}
