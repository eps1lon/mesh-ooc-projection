import { normalRight } from '../math/facette';
import vector, { add } from '../math/vector';
import FaceMesh, { DenormalizedNormal, Vertex, Face } from './FaceMesh';

export interface VertexWithNormal extends Vertex {
  normal: DenormalizedNormal;
}
export interface FaceWithNormal extends Face {
  normal: DenormalizedNormal; // right handed
}

// Sum of all incident face normals (denormalized)
export type LowPolyMesh = FaceMesh<VertexWithNormal, FaceWithNormal>;

export default function build(mesh: FaceMesh): LowPolyMesh {
  const vertices: VertexWithNormal[] = mesh.vertices.map(vertex => {
    // init identity normal
    return {
      ...vertex,
      normal: vector(0, 0, 0)
    };
  });

  // face pass:
  // calculate face normal
  // add face normal to vertices of that face
  const faces: FaceWithNormal[] = mesh.faces.map(face => {
    const soup = mesh.dereference(face);

    const normal = normalRight(soup);
    // only add "outwards" facing normal to vertex normal
    for (let i = 0; i <= 2; ++i) {
      // vertices[face[i]].normal += normal
      vertices[face.vertices[i]].normal = add(
        vertices[face.vertices[i]].normal,
        normal
      );
    }

    return {
      ...face,
      normal
    };
  });

  return new FaceMesh(vertices, faces);
}
