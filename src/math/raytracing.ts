import { add, sub, cross, dot, scalarMul, invert } from './vector';

// Möller–Trumbore but with ignore direction of ray
export function rayIntersectionTriangle<T>(
  origin: Vector,
  dir: Vector,
  triangle: T,
  getVertices: (triangle: T) => Vector[]
): Vector | undefined {
  // https://en.wikipedia.org/w/index.php?title=M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm&oldid=810621404
  const EPSILON = 0.000001;
  const vertices = getVertices(triangle);

  const edge1 = sub(vertices[1], vertices[0]);
  const edge2 = sub(vertices[2], vertices[0]);
  const h = cross(dir, edge2);
  const a = dot(edge1, h);
  if (a > -EPSILON && a < EPSILON) {
    return undefined;
  }

  const f = 1 / a;
  const s = sub(origin, vertices[0]);
  const u = f * dot(s, h);
  if (u < 0.0 || u > 1.0) {
    return undefined;
  }
  const q = cross(s, edge1);
  const v = f * dot(dir, q);
  if (v < 0.0 || u + v > 1.0) {
    return undefined;
  }
  // At this stage we can compute t to find out where the intersection point is on the line.
  const t = f * dot(edge2, q);

  // line intersection
  return add(origin, scalarMul(t, dir));
}

interface Cube {
  min: Vector;
  max: Vector;
}

export function rayIntersectionCube(
  origin: Vector,
  dir: Vector,
  cube: Cube
): number {
  let lo = -Infinity;
  let hi = +Infinity;

  for (let i = 0; i < 3; i++) {
    let dimLo = (cube.min[i] - origin[i]) / dir[i];
    let dimHi = (cube.max[i] - origin[i]) / dir[i];

    if (dimLo > dimHi) {
      const tmp = dimLo;
      dimLo = dimHi;
      dimHi = tmp;
    }

    if (dimHi < lo || dimLo > hi) {
      return Number.POSITIVE_INFINITY;
    }

    if (dimLo > lo) {
      lo = dimLo;
    }
    if (dimHi < hi) {
      hi = dimHi;
    }
  }

  return lo > hi ? Number.POSITIVE_INFINITY : lo;
}

export function rayIntersectionCubeUndirected(
  origin: Vector,
  dir: Vector,
  cube: Cube
): number {
  const forward = rayIntersectionCube(origin, dir, cube);
  if (forward < Number.POSITIVE_INFINITY) {
    return forward;
  } else {
    return rayIntersectionCube(origin, invert(dir), cube);
  }
}

export function pointWithinCube(p: Vector, cube: Cube): boolean {
  for (let dim = 0; dim <= 2; ++dim) {
    if (p[0] < cube.min[0] || p[0] > cube.max[0]) {
      return false;
    }
  }
  return true;
}
