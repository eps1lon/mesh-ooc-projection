/* tslint:disable: no-bitwise */
import { Bbox, intersect as bboxIntersect } from '../math/bbox';

const NODE_SIZE = 10;

export type Node<F> = InternalNode<F> | LeafNode<F>;

export interface LeafNode<F> {
  triangles: F[];
  bbox: Bbox;
}

export interface InternalNode<F> extends LeafNode<F> {
  left: Node<F>;
  right: Node<F>;
}

export type GetVertices<F> = (face: F) => [Vector, Vector, Vector];

export default function build<F>(
  faces: F[],
  getVertices: GetVertices<F>
): Node<F> {
  return buildNode(faces, getVertices, 0);
}

export function isInternal<F>(node: Node<F>): node is InternalNode<F> {
  // @ts-ignore: yes it does not exists thats what i want to find out
  return node.left !== undefined && node.right !== undefined;
}

export function isLeaf<F>(node: Node<F>): node is LeafNode<F> {
  // @ts-ignore: yes it does not exists thats what i want to find out
  return node.left === undefined && node.right === undefined;
}

// TODO: outer distance?
export function inBbox<F>(node: Node<F>, aabb: Bbox): F[] {
  if (bboxIntersect(node.bbox, aabb)) {
    if (isInternal(node)) {
      return [...inBbox(node.left, aabb), ...inBbox(node.right, aabb)];
    } else {
      return node.triangles;
    }
  } else {
    return [];
  }
}

function buildNode<F>(
  triangles: F[],
  getVertices: GetVertices<F>,
  depth: number
): Node<F> {
  // round robin
  const split = depth % 3;

  if (triangles.length > NODE_SIZE) {
    // triangles with the minimum coord in {split} plane
    const with_min = triangles.map(triangle => {
      return {
        triangle,
        min: Math.min(...getVertices(triangle).map(p => p[split]))
      };
    });
    // sort triangles along {split} plane
    const plane_sorted = with_min.sort((a, b) => a.min - b.min);

    // split at median
    const split_index = plane_sorted.length >> 1;

    return {
      triangles,
      bbox: computeBbox(triangles, getVertices),
      left: buildNode(
        plane_sorted.slice(0, split_index).map(({ triangle }) => triangle),
        getVertices,
        depth + 1
      ),
      right: buildNode(
        plane_sorted.slice(split_index).map(({ triangle }) => triangle),
        getVertices,
        depth + 1
      )
    };
  } else {
    return {
      triangles,
      bbox: computeBbox(triangles, getVertices)
    };
  }
}

/* tslint:disable: curly */
function computeBbox<F>(triangles: F[], getVertices: GetVertices<F>) {
  const aabb: Bbox = {
    min: [
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY
    ],
    max: [
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY
    ]
  };

  for (const triangle of triangles) {
    for (const vertex of getVertices(triangle)) {
      for (let dim = 0; dim <= 2; ++dim) {
        if (vertex[dim] < aabb.min[dim]) aabb.min[dim] = vertex[dim];
        if (vertex[dim] > aabb.max[dim]) aabb.max[dim] = vertex[dim];
      }
    }
  }

  return aabb;
}
