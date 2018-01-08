import { Transform } from 'stream';
const through = require('through2');

import { Node } from '../nodes';

import toText from '../nodesToText';

// reads a colored .off file and and writes out ast nodes
export interface Options {
  delim?: string;
  limit?: number;
}
export default function offWriteStream(options: Options = {}) {
  const { delim = '\r\n', limit = Number.POSITIVE_INFINITY } = options;

  // chars
  let written = 0;

  return through({ objectMode: true }, function(
    this: Transform,
    node: Node,
    enc: string,
    done: () => void
  ) {
    const text = toText(node) + delim;

    if (written >= limit) {
      this.push(null);
      this.emit('close'); // otherwise this will still be called
    } else {
      this.push(text);
      written = written + text.length;
    }

    done();
  });
}
