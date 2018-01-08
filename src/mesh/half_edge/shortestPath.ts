import { distance } from '../../math/vector';
import { min } from '../../util';
import {
  Vertex,
  HalfEdge,
  outgoingEdges,
  innerAngle,
  origin
} from './HalfEdge';

export class PathNotFound extends Error {
  constructor(source: Vertex, target: Vertex) {
    super(`path not found from ${source.id} to ${target.id}`);
  }
}

export class PathDisallowed extends Error {
  constructor() {
    super(`Visited boundary vertex as possibly shortest path. \
    Set 'allow_boundary' to true or fetch additional mesh data`);
  }
}

export type Path = HalfEdge[];

interface Options {
  allow_boundary?: boolean;
}
// a* impl for half edge structure
// https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode
// non manifold half edge mesh!
export default function shortestPath(
  source: Vertex,
  target: Vertex,
  options: Options = {}
): Path {
  const { allow_boundary = false } = options;
  const closed: Set<Vertex> = new Set();
  const open: Set<Vertex> = new Set([source]);

  const came_from = new Map<Vertex, HalfEdge>();

  // dont init because we dont know how many vertices (yet)
  // so use function and use +inf if g_score undefined
  const g_score = new Map<Vertex, number>();
  const getGScore = createGetValue(g_score, Number.POSITIVE_INFINITY);
  g_score.set(source, 0);

  const f_score = new Map<Vertex, number>();
  const getFScore = createGetValue(f_score, Number.POSITIVE_INFINITY);
  f_score.set(source, distance(source.p, target.p));

  while (open.size > 0) {
    const current = min(open, vertex => getFScore(vertex));

    if (current === target) {
      return reconstructPath(came_from, current);
    }

    open.delete(current);
    closed.add(current);

    for (const outgoing of outgoingEdges(current)) {
      const neighbour = outgoing.target;

      if (neighbour.attributes.boundary && !allow_boundary) {
        throw new PathDisallowed();
      }

      if (closed.has(neighbour)) {
        continue;
      }

      if (!open.has(neighbour)) {
        open.add(neighbour);
      }

      const tentative_g_score =
        getGScore(current) + distance(current.p, neighbour.p);

      if (tentative_g_score >= getGScore(neighbour)) {
        continue;
      }

      came_from.set(neighbour, outgoing);
      g_score.set(neighbour, tentative_g_score);
      f_score.set(
        neighbour,
        getGScore(neighbour) + distance(neighbour.p, target.p)
      );
    }
  }

  throw new PathNotFound(source, target);
}

function reconstructPath(
  came_from: Map<Vertex, HalfEdge>,
  start: Vertex
): HalfEdge[] {
  const path: HalfEdge[] = [];
  let current = start;

  while (came_from.has(current)) {
    // Map#has as a typeguard for map.get
    path.unshift(came_from.get(current) as HalfEdge);
    current = origin(path[0]);
  }

  return path;
}

function createGetValue(map: Map<Vertex, number>, default_value: number) {
  return (v: Vertex) => {
    const elem = map.get(v);
    return elem === undefined ? default_value : elem;
  };
}

/**
 * adjusted for some edge cases where we go from a polygon to a sliver
 * i.e. an halfedge whose inverse is also on the path
 * @param path
 * @returns number sum angle of all edge pairs
 */
export function pathAngle(path: Path): { inner: number; outer: number } {
  const edges = new Set(path);

  let inner = 0;
  let outer = 0;

  for (let i = 0; i < path.length; ++i) {
    const edge = path[i];

    if (!onSliver(edge, edges)) {
      let next = path[(i + 1) % path.length];

      if (onSliver(next, edges)) {
        if (next.inverse === undefined) {
          // typescript specific, just so assure ts that onSliver does not
          // mutate
          throw new Error('a sliver can only happen when inverse are defined');
        }
        // use the edge that follows the edge that is the last of this sliver
        next =
          path[
            (path.findIndex(other => other === next.inverse) + 1) % path.length
          ];
      }

      const angle = innerAngle(edge, next);

      inner = inner + angle;
      outer = outer + 2 * Math.PI - angle;
    }
  }

  return { inner, outer };
}

function onSliver(edge: HalfEdge, path: Set<HalfEdge>): boolean {
  return edge.inverse !== undefined && path.has(edge.inverse);
}
