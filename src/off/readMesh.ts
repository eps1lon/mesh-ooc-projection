import FaceMesh, { Face } from '../mesh/FaceMesh';
import fileRead from './streams/pipes/fileRead';
import { Node, isFace, isColoredVertex, isVertex } from './nodes';

export interface OffVertexAttributes {
  color?: [number, number, number];
}

export interface OffVertex {
  p: Vector;
  attributes: OffVertexAttributes;
}

export interface Options {
  // delimiter for off file
  delimiter?: string;
}
export default function loadMesh(
  file_path: string,
  options: Options = {}
): Promise<FaceMesh> {
  return new Promise((resolve, reject) => {
    const stream = fileRead(file_path, options);

    const vertices: OffVertex[] = [];
    const faces: Face[] = [];

    stream.on('error', (err: Error) => reject(err));
    stream.on('end', () => resolve(new FaceMesh(vertices, faces)));

    // put stream in flowing mode
    stream.on('data', (node: Node) => {
      if (isFace(node)) {
        faces.push({ vertices: node.vertices });
      } else if (isVertex(node)) {
        if (isColoredVertex(node)) {
          vertices.push({
            p: [node.x, node.y, node.z],
            attributes: {
              color: [node.color.r, node.color.g, node.color.b]
            }
          });
        } else {
          vertices.push({
            p: [node.x, node.y, node.z],
            attributes: {}
          });
        }
      }
    });
  });
}
