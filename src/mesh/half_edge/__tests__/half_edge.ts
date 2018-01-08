/// <reference types="@types/jest" />
import { facePoints } from '../HalfEdge';
import faceMeshToHalfEdge from '../../faceMeshToHalfEdge';
import big_mesh from './__fixtures__/mesh';

it('should dereference face vertices', () => {
  const mesh = faceMeshToHalfEdge(big_mesh);

  expect(mesh.faces.map(face => facePoints(face))).toMatchSnapshot();
});
