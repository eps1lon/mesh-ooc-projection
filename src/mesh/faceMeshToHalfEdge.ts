import FaceMesh, { VertexId } from './FaceMesh';
import {
  HalfEdgeMesh,
  HalfEdge,
  Face,
  Vertex,
  outgoingEdges,
  origin
} from './half_edge/HalfEdge';
import { doubleLink } from './half_edge/util/DoubleLinkedList';

// TODO: validate that prev,next,inverse are set
export default function facesToHalfEdges(mesh: FaceMesh): HalfEdgeMesh {
  const edges: HalfEdge[] = [];
  const faces: Face[] = [];
  const vertices: Vertex[] = mesh.vertices.map(
    (vertex, id) =>
      ({
        id,
        p: vertex.p,
        attributes: vertex.attributes
      } as Vertex)
  );

  let edge_id = 0;
  mesh.faces.forEach((mesh_face, face_id) => {
    const face: Face = {
      id: face_id
    } as Face;

    const half_edges: HalfEdge[] = [];

    // build half edges
    mesh_face.vertices.forEach((cur_vertex_id, i) => {
      const next_vertex_index = (i + 1) % mesh_face.vertices.length;
      const next_vertex_id = mesh_face.vertices[next_vertex_index];
      const next_vertex = vertices[next_vertex_id];

      const half_edge: HalfEdge = {
        id: edge_id,
        target: next_vertex,
        face
      } as HalfEdge;

      // first generated edge gets referenced in face
      if (face.edge === undefined) {
        face.edge = half_edge;
      }

      // vertex doesnt have an edge yet
      if (vertices[cur_vertex_id].edge === undefined) {
        vertices[cur_vertex_id].edge = half_edge;
      }

      ++edge_id;

      half_edges.push(half_edge);
    });

    faces.push(face as Face);

    edges.push(...doubleLink(half_edges));
  });

  const { non_manifold } = inverseMatching(edges);
  if (non_manifold > 0) {
    // tslint:disable-next-line: no-console
    console.warn('encountered non manifold edges, pathfinding might not work');
  }

  // mark every vertex with boundary edges as incomplete (see #9)
  for (const vertex of vertices) {
    vertex.attributes.boundary = outgoingEdges(vertex).some(
      edge => edge.inverse === undefined
    );
  }
  // at this point every vertex is initialized
  return { edges, faces, vertices };
}

function inverseMatching(half_edges: HalfEdge[]) {
  let borders = 0;
  let matches = 0;
  let non_manifold = 0;

  const sorted = half_edges
    .map(edge => {
      return [origin(edge).id, edge.target.id, edge] as [
        VertexId,
        VertexId,
        HalfEdge
      ];
    })
    .map(([source, target, edge]) => {
      // internal index sort
      if (source > target) {
        return [target, source, edge] as [VertexId, VertexId, HalfEdge];
      } else {
        return [source, target, edge] as [VertexId, VertexId, HalfEdge];
      }
    })
    .sort((a, b) => {
      const primary = a[0] - b[0];
      const secondary = a[1] - b[1];

      return primary !== 0 ? primary : secondary;
    });

  for (let i = 0; i < sorted.length - 1; ) {
    const edge: HalfEdge = sorted[i][2];

    let j = i + 1;
    for (j; j < sorted.length; ++j) {
      if (sorted[i][0] !== sorted[j][0] || sorted[i][1] !== sorted[j][1]) {
        break;
      }
    }

    const pairs = j - i;

    if (pairs === 1) {
      edge.boundary = true;
      edge.manifold = true;

      ++borders;
    } else if (pairs === 2) {
      const inverse: HalfEdge = sorted[i + 1][2];

      edge.inverse = inverse;
      edge.manifold = true;
      edge.boundary = false;

      inverse.inverse = edge;
      inverse.manifold = false;
      inverse.boundary = false;

      matches = matches + 2;
    } else {
      for (let k = i; k < j; ++k) {
        sorted[k][2].manifold = false;
        sorted[k][2].boundary = false;
      }

      non_manifold += pairs;
    }

    i = i + pairs;
  }

  return { matches, borders, non_manifold };
}
