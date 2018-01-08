import { Vertex, HalfEdge, faceEdges } from './HalfEdge';
import shortestPath, { Path, pathAngle } from './shortestPath';

/**
 *
 * @param vertices hull, must be closed, and counter clockwise
 */
export default function verticesWithinBoundary(
  boundary: Vertex[],
  upper_bound: number
): Set<Vertex> {
  // boundary cant have an area
  const distinct_vertices = new Set(boundary);
  if (distinct_vertices.size < boundary.length) {
    return distinct_vertices;
  }

  let boundary_edges: Path = [];

  try {
    boundary_edges = closedBoundary(boundary);
  } catch (err) {
    // TODO remove this. Should not happen on release
    /* tslint:disable-next-line: no-console */
    console.warn(err);
    return new Set();
  }

  const { inner, outer } = pathAngle(boundary_edges);

  if (inner <= outer) {
    return new Set(growInwards(boundary_edges, upper_bound));
  } else {
    // we traversed the boundary in such a way
    // that edge.next is not within the boundary
    return new Set(growInwards(outerBoundary(boundary_edges), upper_bound));
  }
}

function closedBoundary(boundary: Vertex[]): Path {
  const boundary_edges: Path = [];

  for (let i = 0; i < boundary.length - 1; ++i) {
    boundary_edges.push(...shortestPath(boundary[i], boundary[i + 1]));
  }

  // and close the loop
  boundary_edges.push(
    ...shortestPath(boundary[boundary.length - 1], boundary[0])
  );

  return boundary_edges;
}

function outerBoundary(boundary: Path): Path {
  const outer = new Array(boundary.length);

  for (let i = 0; i < boundary.length; ++i) {
    const inner = boundary[i];

    if (inner.inverse !== undefined) {
      outer[i] = inner.inverse;
    }
  }

  return outer;
}

//
function* growInwards(
  boundary: HalfEdge[],
  upper_bound: number
): IterableIterator<Vertex> {
  const edges = new Set(boundary);
  const region: Set<Vertex> = new Set();
  const open: HalfEdge[] = boundary.slice();
  const visited: Set<HalfEdge> = new Set();

  while (open.length > 0) {
    const edge = open.pop();
    if (edge === undefined) {
      break;
    }
    if (region.size > upper_bound) {
      throw new Error('growInwards: upper bound exceeded');
    }

    if (visited.has(edge)) {
      continue;
    }

    if (!region.has(edge.target)) {
      yield edge.target;
    }

    visited.add(edge);
    region.add(edge.target);

    if (!edges.has(edge) && edge.inverse && !visited.has(edge.inverse)) {
      open.unshift(edge.inverse);
    }

    // only iterate over edges of the face if it is not part of a sliver
    if (!edge.inverse || !edges.has(edge.inverse)) {
      // since the edges in the hull were given counter clockwise
      // every face of those edges lies inwards
      // so iterate over each edge in that face an add the inverse of the other
      // edges
      for (const face_edge of faceEdges(edge)) {
        if (!visited.has(face_edge)) {
          open.unshift(face_edge);
        }
      }
    }
  }
}
