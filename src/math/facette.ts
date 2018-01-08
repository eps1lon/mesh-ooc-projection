import { cross, sub } from './vector';

export type Triangle = [Vector, Vector, Vector];

export default function triangle(u: Vector, v: Vector, w: Vector): Triangle {
  return [u, v, w];
}

// normal according to right hand rule
export function normalRight(t: Triangle): Vector {
  return cross(sub(t[2], t[0]), sub(t[1], t[0]));
}

// normal according to left hand rule
export function normalLeft(t: Triangle): Vector {
  return cross(sub(t[1], t[0]), sub(t[2], t[0]));
}
