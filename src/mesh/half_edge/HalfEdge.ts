import computeBboxBase from '../../math/bbox';
import vector, {
  add,
  dot,
  cross,
  sub,
  normalize,
  distance as vectorDistance
} from '../../math/vector';
import { normalRight } from '../../math/facette';
import {
  Normal,
  DenormalizedNormal,
  VertexAttributes as BaseVertexAttributes
} from '../FaceMesh';

// https://www.openmesh.org/Daily-Builds/Doc/a00016.html
// http://www.tandfonline.com/doi/abs/10.1080/10867651.1998.10487494
export type VertexId = number; // Uint32
export interface VertexAttributes extends BaseVertexAttributes {
  projected_heuristic: number;
  boundary: boolean;
}
export interface Vertex {
  attributes: VertexAttributes;
  id: VertexId;
  p: Vector;
  edge?: HalfEdge; // outgoing
}

export type FaceId = number; // Uint32
export interface Face {
  id: FaceId;
  edge: HalfEdge;
}

export type HalfEdgeId = number; // Uint32
export interface HalfEdge {
  id: HalfEdgeId;
  target: Vertex;
  face: Face; // face left of it
  next: HalfEdge;
  inverse?: HalfEdge;
  prev: HalfEdge;
  boundary: boolean;
  manifold: boolean;
}

export interface HalfEdgeMesh {
  edges: HalfEdge[];
  faces: Face[];
  vertices: Vertex[];
}

export function clockwise(edge: HalfEdge) {
  return edge.inverse !== undefined ? edge.inverse.next : undefined;
}

export function counterClockwise(edge: HalfEdge) {
  return edge.prev.inverse;
}

export function* circulate(
  vertex: Vertex,
  next: (edge: HalfEdge) => HalfEdge | undefined
) {
  const first_edge = vertex.edge;

  if (first_edge === undefined) {
    return;
  }

  let next_edge = next(first_edge);

  yield first_edge;

  while (next_edge !== undefined && next_edge !== first_edge) {
    yield next_edge;

    next_edge = next(next_edge);
  }
}

/**
 *
 * @param vertex
 * @return HalfEdge[] orderd counter clockwise
 */
export function outgoingEdges(vertex: Vertex): HalfEdge[] {
  // first iterate to left
  const edges_left = [...circulate(vertex, counterClockwise)]; // this.outgoindEdges(vertex, edge => edge.prev.inverse);
  // then right
  // small overhead at cost of readability => blindly iterate again
  const edges_right = [...circulate(vertex, clockwise)];

  // 1 offset for middle
  if (edges_left[edges_left.length - 1] === edges_right[1]) {
    // full circle => edges_left === edges_right
    return edges_left;
  } else {
    // counter clockwise
    return edges_left.concat(edges_right.slice(1).reverse());
  }
}

export function origin(edge: HalfEdge) {
  return edge.prev.target;
}

/**
 * Finds twin/opposite/inverse half edge of {edge}
 * O(n) where n is the number of outgoing edges from {edge.target}
 *
 * @param source
 * @param edge outgoing edge from {source}
 */
export function inverseEdge(
  source: Vertex,
  edge: HalfEdge
): HalfEdge | undefined {
  return outgoingEdges(edge.target).find(other => other.target === source);
}

/**
 * @param triangle
 * @return 3d coords of each vertex in {face}
 */
export function facePoints(triangle: Face): [Vector, Vector, Vector] {
  const u = triangle.edge;
  const v = u.next;
  const w = v.next;

  return [u.target.p, v.target.p, w.target.p];
}

export function computeBbox(mesh: HalfEdgeMesh) {
  return computeBboxBase(mesh.vertices, vertex => vertex.p);
}

/**
 * iterates over each edge that shares a face with {start}
 * excludes {start}
 * @param start
 */
export function* faceEdges(start: HalfEdge) {
  let cur = start.next;

  while (cur !== start) {
    yield cur;
    cur = cur.next;
  }
}

export function distance(source: Vertex, target: Vertex) {
  return vectorDistance(source.p, target.p);
}

export function innerAngle(e1: HalfEdge, e2: HalfEdge): number {
  const N = plane(e1, e2);

  const p1 = origin(e1).p;
  const p2 = e1.target.p;
  const p3 = e2.target.p;

  const u = normalize(sub(p1, p2));
  const v = normalize(sub(p3, p2));

  const cosine = dot(u, v);
  let angle = Math.acos(cosine);

  // rounding error
  if (Number.isNaN(angle)) {
    if (cosine > 0) {
      angle = Number.EPSILON;
    } else {
      angle = Math.PI - Number.EPSILON;
    }
  }

  if (dot(cross(u, v), N) < 0) {
    return 2 * Math.PI - angle;
  } else {
    return angle;
  }
}

export function plane(...edges: HalfEdge[]): Normal {
  let n: DenormalizedNormal = vector(0, 0, 0);

  for (const edge of edges) {
    n = add(n, normalRight(facePoints(edge.face)));
    if (edge.inverse !== undefined) {
      n = add(n, normalRight(facePoints(edge.inverse.face)));
    }
  }

  return normalize(n);
}
