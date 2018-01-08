import { Normal } from '../mesh/FaceMesh';

export default function vector(x: number, y: number, z: number): Vector {
  return [x, y, z];
}

export function cross(u: Vector, v: Vector): Vector {
  return vector(
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0]
  );
}

export function dot(u: Vector, v: Vector): number {
  return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

export function add(u: Vector, v: Vector): Vector {
  return vector(u[0] + v[0], u[1] + v[1], u[2] + v[2]);
}

export function sub(u: Vector, v: Vector): Vector {
  return vector(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
}

export function scalarMul(t: number, u: Vector): Vector {
  return vector(t * u[0], t * u[1], t * u[2]);
}

export function length(v: Vector): number {
  return Math.hypot(v[0], v[1], v[2]);
}

export function distance(u: Vector, v: Vector): number {
  return Math.hypot(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
}

export function normalize(v: Vector): Vector {
  const l = length(v);

  return vector(v[0] / l, v[1] / l, v[2] / l);
}

export function project(p: Vector, n: Normal): Vector {
  // p - (n dot p) * n
  return sub(p, scalarMul(dot(n, p), n));
}

export function invert(v: Vector): Vector {
  return vector(-v[0], -v[1], -v[2]);
}
