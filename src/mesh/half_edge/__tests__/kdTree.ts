/// <reference types="@types/jest" />
/// <reference types="@types/node" />
import * as fs from 'fs';
import * as path from 'path';

import buildKdTree, { Node, isInternal } from '../kdTree';
import faceMeshToHalfEdge from '../../faceMeshToHalfEdge';
import big_mesh from './__fixtures__/mesh';

const serializeNode = (node?: Node) => {
  if (node === undefined) {
    return node;
  }

  return {
    ...node,
    left: serializeNode(isInternal(node) ? node.left : undefined),
    right: serializeNode(isInternal(node) ? node.right : undefined),
    triangles: node.triangles.map(t => t.id)
  };
};

it('should match snapshots', () => {
  const tree = buildKdTree(faceMeshToHalfEdge(big_mesh).faces);
  expect(serializeNode(tree)).toMatchSnapshot();
});
