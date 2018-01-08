import vector from './vector';

export interface Bbox {
  min: Vector;
  max: Vector;
}

export default function bbox<V>(
  vertices: V[],
  getCoords: (v: V) => Vector
): Bbox {
  const min = vector(
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY
  );
  const max = vector(
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY
  );

  for (const vertex of vertices) {
    const p = getCoords(vertex);

    if (p[0] < min[0]) {
      min[0] = p[0];
    }
    if (p[1] < min[1]) {
      min[1] = p[1];
    }
    if (p[2] < min[2]) {
      min[2] = p[2];
    }
    if (p[0] > max[0]) {
      max[0] = p[0];
    }
    if (p[1] > max[1]) {
      max[1] = p[1];
    }
    if (p[2] > max[2]) {
      max[2] = p[2];
    }
  }

  return { min, max };
}
/**
 * collission detection between a and b
 * @param a
 * @param b
 */
export function intersect(a: Bbox, b: Bbox) {
  // http://www.informatik.tu-freiberg.de/lehre/pflicht/VR/ws06/VR10_Collision-Detection.pdf
  // tslint:disable: curly
  if (a.min[0] > b.max[0] || b.min[0] > a.max[0]) return false;
  if (a.min[1] > b.max[1] || b.min[1] > a.max[1]) return false;
  if (a.min[2] > b.max[2] || b.min[2] > a.max[2]) return false;
  return true;
}
