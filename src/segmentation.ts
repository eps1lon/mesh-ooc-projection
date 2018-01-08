import { readFile, writeFile } from './util/fs';

export type SegmentIndices = Int32Array;

// if no segment index has been assigned yet
// positive indices are for chambers
// -1 for passages
export const UNDEFINED_INDEX = -2;

export function initIndices(num_vertices: number) {
  return new Int32Array(num_vertices).fill(UNDEFINED_INDEX);
}

export async function load(filepath: string): Promise<SegmentIndices> {
  const file = await readFile(filepath);

  return new Int32Array(file.buffer);
}

export async function write(
  filepath: string,
  indices: SegmentIndices
): Promise<void> {
  // @ts-ignore: node documentation says "or the .buffer property of a TypedArray."
  return await writeFile(filepath, Buffer.from(indices.buffer));
}
