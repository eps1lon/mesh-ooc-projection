/// <reference types="@types/jest" />
import FaceMesh, { Vertex } from '../../FaceMesh';
import { HalfEdgeMesh, inverseEdge, outgoingEdges } from '../HalfEdge';
import faceMeshToHalfEdge from '../../faceMeshToHalfEdge';
import big_mesh from './__fixtures__/mesh';
import { meshToJson } from '../toJson';

const face_mesh: FaceMesh = new FaceMesh(
  [
    { p: [0, 0, 0], attributes: {} }, // a=0
    { p: [2, 4, 0], attributes: {} }, // b=1
    { p: [1, 5, 0], attributes: {} }, // c=2
    { p: [5, 0, 0], attributes: {} }, // d=3
    { p: [2, -2, 0], attributes: {} }, // e=4
    { p: [0, -3, 0], attributes: {} } // f=5
  ],
  [
    { vertices: [0, 1, 2] },
    { vertices: [0, 4, 1] },
    { vertices: [1, 4, 3] },
    { vertices: [0, 5, 4] }
  ]
);

const mesh = faceMeshToHalfEdge(face_mesh);

it('should know outgoing all! edges', () => {
  const outgoing = outgoingEdges(mesh.vertices[0]).map(edge => ({
    id: edge.id,
    target: edge.target.id
  }));

  expect(outgoing).toHaveLength(3);
});

it('should know inverse edges', () => {
  const inverse_1 = inverseEdge(mesh.vertices[0], mesh.edges[0]);
  expect(inverse_1).toBeDefined();

  if (inverse_1 !== undefined) {
    expect(inverse_1.target).toEqual(mesh.vertices[0]);
  }
});

it('should convert with prev/next/inverse', () => {
  // obvious
  expect(mesh.faces).toHaveLength(face_mesh.faces.length);
  expect(mesh.vertices).toHaveLength(face_mesh.vertices.length);

  expect(mesh.edges).toHaveLength(face_mesh.faces.length * 3);
  expect(
    mesh.edges.map(edge => ({
      id: edge.id,
      target: edge.target.id,
      next: edge.next.id,
      prev: edge.prev.id,
      face: edge.face.id,
      inverse: edge.inverse ? edge.inverse.id : null,
      manifold: edge.manifold,
      boundary: edge.boundary
    }))
  ).toMatchSnapshot();
});

it('should have face which have one edge', () => {
  expect(mesh.faces.every(face => face.edge !== undefined)).toBe(true);
});

it('should match snapshots', () => {
  expect(meshToJson(faceMeshToHalfEdge(big_mesh))).toMatchSnapshot();
});
