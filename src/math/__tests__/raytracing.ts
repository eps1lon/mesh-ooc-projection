/// <reference types="@types/jest" />
import triangle, { Triangle } from '../facette';
import { rayIntersectionTriangle, rayIntersectionCube } from '../raytracing';
import vector from '../vector';

const getVertices = (face: Triangle) => face;

it('returns undefined if no intersection is found', () => {
  const i1 = rayIntersectionTriangle(
    vector(0, 0, 0),
    vector(0, 500, 0),
    triangle(vector(0, 3, 50.5), vector(-3, -3, 50.5), vector(3, -3, 50.5)),
    getVertices
  );

  expect(i1).toBeUndefined();
});

it('returns undefined if the origin is within the triangle', () => {
  const i1 = rayIntersectionTriangle(
    vector(0, 0, 0),
    vector(0, 1, 0),
    triangle(vector(0, 3, 0), vector(-3, -3, 0), vector(3, -3, 0)),
    getVertices
  );

  expect(i1).toBeUndefined();
});

it('should ignore vertex order in faces', () => {
  const i1 = rayIntersectionTriangle(
    vector(0, 0, 0),
    vector(0, 0, 1),
    triangle(vector(0, 3, 50.5), vector(-3, -3, 50.5), vector(3, -3, 50.5)),
    getVertices
  );
  const i2 = rayIntersectionTriangle(
    vector(0, 0, 0),
    vector(0, 0, 1),
    triangle(vector(0, 3, 50.5), vector(3, -3, 50.5), vector(-3, -3, 50.5)),
    getVertices
  );

  expect(i1).toEqual(i2);
});

it('should ignore ray direction', () => {
  const i1 = rayIntersectionTriangle(
    vector(0, 0, 0),
    vector(0, 0, 1),
    triangle(vector(0, 3, 50.5), vector(-3, -3, 50.5), vector(3, -3, 50.5)),
    getVertices
  );
  const i2 = rayIntersectionTriangle(
    vector(0, 0, 0),
    vector(0, 0, -1),
    triangle(vector(0, 3, 50.5), vector(3, -3, 50.5), vector(-3, -3, 50.5)),
    getVertices
  );

  expect(i1).toEqual(i2);

  expect(
    rayIntersectionCube([0, 0, 0], [-1, -1, -1], {
      min: [2, 2, 2],
      max: [3, 3, 3]
    })
  ).toBe(-3);
});

it('should know cube intersections', () => {
  const hit1 = rayIntersectionCube([0, 0, 0], [1, 1, 1], {
    min: [2, 2, 2],
    max: [3, 3, 3]
  });

  expect(hit1).toBe(2);

  const hit2 = rayIntersectionCube(
    [-145.58900451660156, -443.7850036621094, 92.35890197753906],
    [-0.6779341697692871, -0.46019479632377625, 0.5732591152191162],
    {
      min: [-154.42449951171875, -454.9873962402344, 83.27851867675781],
      max: [-127.55079650878906, -431.559814453125, 108.0833969116211]
    }
  );

  expect(hit2).toBeCloseTo(-15.8399);

  expect(
    rayIntersectionCube(
      [21.199100494384766, -222.51199340820312, 104.9469985961914],
      [0.06258586049079895, 0.0400710254907608, 0.9972348213195801],
      {
        min: [-154.42449951171875, -454.9873962402344, 83.27851867675781],
        max: [-127.55079650878906, -431.559814453125, 108.0833969116211]
      }
    )
  ).toBe(Number.POSITIVE_INFINITY);
});
