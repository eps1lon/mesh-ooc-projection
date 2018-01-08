import * as PriorityQueue from 'priorityqueuejs';

import { Node as KdTreeNode } from './kdTree';
import { Face as HalfEdgeFace, facePoints } from './HalfEdge';
import { Normal, Vertex } from '../FaceMesh';
import { Bbox } from '../../math/bbox';
import { distance as calcDistance } from '../../math/vector';
import {
  rayIntersectionTriangle,
  rayIntersectionCubeUndirected,
  pointWithinCube
} from '../../math/raytracing';
import { isInternal } from '../../hierarchies/kdTree';

interface ClosestData {
  face?: HalfEdgeFace;
  distance: number;
}

interface PriorityData {
  distance: number;
  node: KdTreeNode;
}

// finds closest face that intersects with {normal}
// returns the vertex within that face which is closest to the intersection point
export function closestFaceTree(
  origin: Vertex,
  normal: Normal,
  root: KdTreeNode,
  depth: number
): ClosestData {
  let closest: ClosestData = {
    distance: Number.POSITIVE_INFINITY
  };

  // https://www.scratchapixel.com/lessons/advanced-rendering/introduction-acceleration-structure/bounding-volume-hierarchy-BVH-part2
  if (bboxDistance(origin.p, normal, root.bbox) < Number.POSITIVE_INFINITY) {
    const queue = new PriorityQueue<PriorityData>((a, b) => {
      // smallest has highest prio
      return b.distance - a.distance;
    });

    queue.enq({ distance: 0, node: root });

    while (!queue.isEmpty() && queue.peek().distance < closest.distance) {
      const { node } = queue.deq();

      if (isInternal(node)) {
        queue.enq({
          node: node.left,
          distance: bboxDistance(origin.p, normal, node.left.bbox)
        });
        queue.enq({
          node: node.right,
          distance: bboxDistance(origin.p, normal, node.right.bbox)
        });
      } else {
        const new_closest = closestFaceLinear(origin, normal, node.triangles);

        if (new_closest.distance < closest.distance) {
          closest = new_closest;
        }
      }
    }
  }

  return closest;
}

function bboxDistance(o: Vector, dir: Vector, cube: Bbox) {
  if (pointWithinCube(o, cube)) {
    return 0;
  } else {
    return rayIntersectionCubeUndirected(o, dir, cube);
  }
}

export function closestFaceLinear(
  origin: Vertex,
  normal: Normal,
  faces: HalfEdgeFace[]
): ClosestData {
  let closest: HalfEdgeFace | undefined;
  let closest_distance = Number.POSITIVE_INFINITY;

  for (const face of faces) {
    const intersection = rayIntersectionTriangle(
      origin.p,
      normal,
      face,
      facePoints
    );

    if (intersection !== undefined) {
      const distance = calcDistance(origin.p, intersection);

      if (distance < closest_distance) {
        closest_distance = distance;
        // TODO set to closest vertex in face
        closest = face;
      }
    }
  }

  return { face: closest, distance: closest_distance };
}
