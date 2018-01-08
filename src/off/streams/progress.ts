/* tslint:disable: no-console */
import { Transform } from 'stream';
const through = require('through2');

import { Node } from '../nodes';

// displays progress of pass through off nodes
export default function offProgressStream() {
  const progress_steps = { vertex: 0, face: 0 };
  let vertex_count = 0;
  let face_count = 0;

  return through({ objectMode: true }, function(
    this: Transform,
    node: Node,
    enc: string,
    done: () => void
  ) {
    if (node.type === 'meta') {
      progress_steps.vertex = Math.floor(node.vertex_count / 10);
      progress_steps.face = Math.floor(node.face_count / 10);
      console.log(node.vertex_count, node.face_count);
    } else if (node.type === 'vertex') {
      ++vertex_count;
    } else if (node.type === 'face') {
      ++face_count;
    }

    if (vertex_count && vertex_count % progress_steps.vertex === 0) {
      console.log(
        vertex_count / progress_steps.vertex * 10 + '% vertices written'
      );
    }
    if (face_count && face_count % progress_steps.face === 0) {
      console.log(face_count / progress_steps.face * 10 + '% faces written');
    }

    // simple pass through
    this.push(node);
    done();
  });
}
