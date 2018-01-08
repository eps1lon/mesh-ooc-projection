import { Face, HalfEdge, Vertex, HalfEdgeMesh } from './HalfEdge';

// return non-circular structures

export function meshToJson(mesh: HalfEdgeMesh) {
  return {
    edges: mesh.edges.map(edgeToJson),
    faces: mesh.faces.map(faceToJson),
    vertices: mesh.vertices.map(vertexToJson)
  };
}

export function faceToJson(face: Face): {} {
  return {
    id: face.id,
    edge: face.edge.id
  };
}

export function edgeToJson(edge: HalfEdge): {} {
  return {
    id: edge.id,
    target: edge.target.id,
    prev: edge.prev.id,
    next: edge.next.id,
    inverse: edge.inverse ? edge.inverse.id : undefined,
    face: edge.face.id
  };
}

export function vertexToJson(vertex: Vertex): {} {
  return {
    id: vertex.id,
    attributes: vertex.attributes,
    edge: vertex.edge ? vertex.edge.id : undefined,
    p: vertex.p
  };
}
