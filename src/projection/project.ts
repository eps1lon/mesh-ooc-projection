/* tslint:disable: no-console */
import { distance } from '../math/vector';
import { VertexWithNormal as Vertex } from '../mesh/withNormals';
import {
  HalfEdgeMesh,
  Vertex as HalfEdgeVertex
} from '../mesh/half_edge/HalfEdge';
import { closestFaceTree } from '../mesh/half_edge/closestFace';
import buildKdTree from '../mesh/half_edge/kdTree';
import verticesWithinBoundary from '../mesh/half_edge/verticesWithinBoundary';
import { min } from '../util';

// At what percentage of the mesh we throw in region growing
const UPPER_BOUND = +(process.env.REGION_UPPER_BOUND || 0.5);

const createNoopProgress = (length: number) => () => {
  return;
};

export default function project<F>(
  high_res_mesh: HalfEdgeMesh,
  low_poly_faces: F[],
  lowPolyVertices: (face: F) => [Vertex, Vertex, Vertex],
  createProgress: (length: number) => () => void = createNoopProgress
): number {
  // if a projected region grows above this size
  // we assume that the boundary could not be determined in a counter clockwise order
  // and the region therefore grew outwards
  const region_bound = Math.floor(high_res_mesh.vertices.length * UPPER_BOUND);
  // # of vertices colorized
  let painted = 0;

  const progress = createProgress(low_poly_faces.length);

  console.time('kd_tree');
  const kd_tree = buildKdTree(high_res_mesh.faces);
  console.timeEnd('kd_tree');

  // raytracing cache
  const projection = new WeakMap<Vertex, HalfEdgeVertex | undefined>();

  for (const low_poly_face of low_poly_faces) {
    // dereference, counter clockwise
    const low_poly_vertices = lowPolyVertices(low_poly_face);

    const high_res_vertices: HalfEdgeVertex[] = [];

    for (let id = 0; id < low_poly_vertices.length; ++id) {
      const vertex = low_poly_vertices[id];
      let high_res_vertex: HalfEdgeVertex | undefined;

      if (!projection.has(vertex)) {
        // project vertex onto cluster
        const { face: high_res_face } = closestFaceTree(
          vertex,
          vertex.normal,
          kd_tree,
          0
        );

        // and cache the value
        if (high_res_face !== undefined) {
          projection.set(vertex, high_res_face.edge.target);
        } else {
          projection.set(vertex, undefined);
        }
      }

      high_res_vertex = projection.get(vertex);

      if (high_res_vertex !== undefined) {
        high_res_vertices.push(high_res_vertex);
      } else {
        break;
      }
    }

    // FIXME: what if this never happens because of resolution?
    const propjected_vertices = high_res_vertices.length;
    if (propjected_vertices === 3) {
      // full face was mapped
      // we now have projected each vertex of the face in low_res into high res
      // now find a path that connects all those projecteded vertices
      // if it is closed iterate over each vertex within that plane
      // and color it
      try {
        // TODO add heuristic to determine whether we accidentally grew outwards
        const overlaid = verticesWithinBoundary(
          high_res_vertices,
          region_bound
        );

        painted = painted + overlaid.size;

        // color the projected high res
        projectAttributes(low_poly_vertices, high_res_vertices, overlaid);
      } catch (err) {
        console.warn(err);
      }
    } else if (propjected_vertices > 0) {
      console.warn('partial face projection');
    }
    progress();
  }

  return painted;
}

function projectAttributes(
  low_poly_vertices: Vertex[],
  seeds: HalfEdgeVertex[],
  targets?: Iterable<HalfEdgeVertex>,
  options: { recolor?: boolean } = {}
): void {
  // color the projected high res vertices just like the low res vertices
  seeds.forEach((vertex, id) => {
    vertex.attributes.color = low_poly_vertices[id].attributes.color;
    vertex.attributes.segment = low_poly_vertices[id].attributes.segment;
    vertex.attributes.projected_heuristic = 0;
  });

  if (targets !== undefined) {
    // and use those as seeds, seeds is now a subset of overlaid
    projectRegionAttributes(seeds, targets);
  }
}

// source are seeds for coloring
// each target gets the color of its closest seed
// closest lookup is O(n) in seeds. seeds is intended to have 3 vertices
function projectRegionAttributes(
  seeds: HalfEdgeVertex[],
  targets: Iterable<HalfEdgeVertex>
): void {
  for (const vertex of targets) {
    const closest = min(seeds, seed => distance(seed.p, vertex.p));

    const heuristic = distance(closest.p, vertex.p);
    const prev_heuristic = vertex.attributes.projected_heuristic;

    if (vertex.attributes.color === undefined || heuristic < prev_heuristic) {
      vertex.attributes.color = closest.attributes.color;
      vertex.attributes.projected_heuristic = heuristic;
    }
    if (vertex.attributes.segment === undefined || heuristic < prev_heuristic) {
      vertex.attributes.segment = closest.attributes.segment;
      vertex.attributes.projected_heuristic = heuristic;
    }
  }
}
