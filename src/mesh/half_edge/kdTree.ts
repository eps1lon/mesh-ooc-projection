import baseBuild, { Node as BaseNode } from '../../hierarchies/kdTree';
import { Face, facePoints } from './HalfEdge';

export { isInternal, isLeaf } from '../../hierarchies/kdTree';

export type Node = BaseNode<Face>;

export default function build(faces: Face[]): Node {
  return baseBuild(faces, facePoints);
}
