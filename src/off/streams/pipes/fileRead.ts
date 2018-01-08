import { createReadStream } from 'fs';
import readStream from '../read';

export interface Options {
  // line delimiter
  delimiter?: string;
  highWaterMark?: number;
}
export default function(filename: string, options: Options = {}) {
  const { delimiter, highWaterMark = 64 * 1024 } = options;

  return createReadStream(filename, { highWaterMark }).pipe(
    readStream(delimiter)
  );
}
