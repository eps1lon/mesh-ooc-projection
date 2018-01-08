/// <reference types="@types/jest" />
import FaceMesh from '../../FaceMesh';
import { HalfEdge, innerAngle, Vertex } from '../HalfEdge';
import faceMeshToHalfEdge from '../../faceMeshToHalfEdge';

it('should compute inner angle in 2 PI domain', () => {
  const p1 = [0, 0, 0];
  const p2 = [1, 0, 0];
  const p3 = [1, 1, 0];
  const p4 = [0, -1, 0];
  const p5 = [-1, -1, 0];

  const { edges } = faceMeshToHalfEdge(
    new FaceMesh(
      [
        { attributes: {}, p: p1 },
        { attributes: {}, p: p2 },
        { attributes: {}, p: p3 },
        { attributes: {}, p: p4 },
        { attributes: {}, p: p5 }
      ],
      [
        { vertices: [0, 4, 3] },
        { vertices: [0, 3, 1] },
        { vertices: [0, 1, 2] }
      ]
    )
  );

  expect(innerAngle(edges[5], edges[5].next)).toBeCloseTo(Math.PI / 2, 10);
  expect(innerAngle(edges[5].next.inverse, edges[5].inverse)).toBeCloseTo(
    3 / 2 * Math.PI,
    10
  );

  expect(innerAngle(edges[8], edges[3])).toBeCloseTo(3 / 4 * Math.PI);
});
