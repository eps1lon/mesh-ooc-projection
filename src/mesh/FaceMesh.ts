import computeBboxBase from '../math/bbox';
import buildKdTree from '../hierarchies/kdTree';

export interface VertexAttributes {
  color?: [number, number, number];
  // Segment index
  segment?: number;
  // a heuristic to determine whether another projection should be allowed
  // to override the attributes
  projected_heuristic?: number;
}
export interface Vertex {
  p: Vector;
  attributes: VertexAttributes;
}
export type VertexId = number; // Uint32
export interface Face {
  vertices: [VertexId, VertexId, VertexId];
}
// nominal typing
export type Normal = Vector; // |Normal| = 1
export type DenormalizedNormal = Vector; // |Normal| != 1

export default class FaceMesh<
  V extends Vertex = Vertex,
  F extends Face = Face
> {
  public vertices: V[];
  public faces: F[];

  constructor(vertices: V[], faces: F[]) {
    this.vertices = vertices;
    this.faces = faces;
  }

  public computeBbox() {
    return computeBboxBase(this.vertices, vertex => vertex.p);
  }

  public dereference(face: F): [Vector, Vector, Vector] {
    return [
      this.vertices[face.vertices[0]].p,
      this.vertices[face.vertices[1]].p,
      this.vertices[face.vertices[2]].p
    ];
  }

  public faceVertices(face: F): [V, V, V] {
    return [
      this.vertices[face.vertices[0]],
      this.vertices[face.vertices[1]],
      this.vertices[face.vertices[2]]
    ];
  }

  public buildKdTree() {
    return buildKdTree(this.faces, face => this.dereference(face));
  }
}
