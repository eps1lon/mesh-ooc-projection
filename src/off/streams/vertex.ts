import { Transform } from 'stream';
const through = require('through2');

import { Node } from '../nodes';

// filter off stream output by type
// in: Node[], out: Vertex[]
export default function offVertexStream() {
  return through({ objectMode: true }, function(
    this: Transform,
    node: Node,
    enc: string,
    done: () => void
  ) {
    if (node.type === 'vertex') {
      this.push(node);
    } else if (node.type === 'face') {
      // truncate
      this.push(null);
    }

    done();
  });
}
