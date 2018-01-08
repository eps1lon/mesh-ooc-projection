import FaceMesh, { Vertex, VertexId, Face } from '../mesh/FaceMesh';
import computeBboxBase from '../math/bbox';

// bottom left corner
export type ClusterPosition = Vector;
export type ClusterId = string;

export type GlobalVertexId = VertexId; //  Uint32

export interface LocalFace extends Face {
  adjacent_clusters: ClusterId[];
  vertices: [GlobalVertexId, GlobalVertexId, GlobalVertexId];
}

export interface LocalVertex extends Vertex {
  vertex_id: GlobalVertexId;
}

export default class Cluster<V extends LocalVertex, F extends LocalFace> {
  public name: ClusterId;
  public readonly adjacent: Set<ClusterId>;
  public readonly adjacent_included: Set<ClusterId>;
  public readonly vertices: V[];

  private faces: F[];
  constructor(vertices: V[], faces: F[], name: ClusterId) {
    this.faces = faces;
    this.vertices = vertices;
    this.name = name;

    this.adjacent = new Set();
    this.adjacent_included = new Set();

    for (const face of this.faces) {
      face.adjacent_clusters.forEach(adjacent => this.adjacent.add(adjacent));
    }
  }

  public addVertex(vertex: V) {
    this.vertices.push(vertex);
  }

  public addFace(face: F) {
    this.faces.push(face);
  }

  public computeBbox() {
    return computeBboxBase(this.vertices, vertex => vertex.p);
  }

  public toMesh(): FaceMesh<V, F> {
    // GlobalVertexId => VertexId
    const local_index = new Map<GlobalVertexId, VertexId>();

    // reindex global indices to local
    this.vertices.forEach(({ vertex_id }, i) => {
      local_index.set(vertex_id, i);
    });

    // reindex global indices to local
    const faces: F[] = this.completeFaces().map(face => {
      return {
        // @ts-ignore
        ...face,
        vertices: face.vertices.map(global_vertex_id =>
          local_index.get(global_vertex_id)
        ) as [number, number, number]
      };
    });

    return new FaceMesh(this.vertices, faces);
  }

  public toMeshWithAdjacent(adjacents: Array<Cluster<V, F>>) {
    const local_index = new Map<GlobalVertexId, VertexId>();

    // reindex global indices to local
    const vertices = this.vertices.map((vertex, i) => {
      local_index.set(vertex.vertex_id, i);

      return vertex;
    });

    const faces: F[] = this.completeFaces().map(face => {
      return this.mapGlobalLocal(face, local_index);
    });

    for (const adjacent of adjacents) {
      for (const vertex of adjacent.vertices) {
        local_index.set(vertex.vertex_id, vertices.length);
        vertices.push(vertex);
      }

      for (const face of adjacent.completeFaces()) {
        faces.push(this.mapGlobalLocal(face, local_index));
      }
    }

    // add the partial faces that are shared with the adjacents
    // we also want to add the partial faces only once since
    // they are duplicated into each cluster that holds a vertex to that face
    // basically we encode a partial face as a string of the cluster ids
    // it resides
    const partials_loaded = new Set<string>();

    for (const face of this.partialFaces()) {
      partials_loaded.add(this.partialId(face.adjacent_clusters));

      faces.push(this.mapGlobalLocal(face, local_index));
    }

    // TODO: simplify by adding global face id to ooc

    // now that all vertices are loaded also add the faces that are shared
    // between adjacent clusters
    for (const adjacent of adjacents) {
      // the partial ids that are loaded with through this adjacent
      const new_partials_loaded = new Set<string>();

      for (const face of adjacent.partialFaces()) {
        const partial_id = adjacent.partialId(face.adjacent_clusters);
        // wheather this face is only shared either with other adjacents
        const shared_with_adjacents = face.adjacent_clusters.every(
          corner_adjacent =>
            adjacents.find(other => other.name === corner_adjacent) !==
            undefined
        );

        if (!partials_loaded.has(partial_id) && shared_with_adjacents) {
          faces.push(this.mapGlobalLocal(face, local_index));
          new_partials_loaded.add(partial_id);
        }
      }

      for (const new_partial_loaded of new_partials_loaded) {
        partials_loaded.add(new_partial_loaded);
      }
    }

    return new FaceMesh(vertices, faces);
  }

  public completeFaces(): F[] {
    return this.faces.filter(face =>
      face.adjacent_clusters.every(cluster_id =>
        this.adjacent_included.has(cluster_id)
      )
    );
  }

  public partialFaces(): F[] {
    return this.faces.filter(face =>
      face.adjacent_clusters.some(
        cluster_id => !this.adjacent_included.has(cluster_id)
      )
    );
  }

  public writeableFaces(): ReadonlyArray<F> {
    return this.faces;
  }

  public clusterNeeded(cluster_id: ClusterId) {
    return (
      this.adjacent.has(cluster_id) && !this.adjacent_included.has(cluster_id)
    );
  }

  /**
   *
   * @param face
   * @param local_index
   * @return F face with only local indices
   */
  private mapGlobalLocal(
    face: F,
    local_index: Map<GlobalVertexId, VertexId>
  ): F {
    const [g1, g2, g3] = face.vertices;
    const v1 = local_index.get(g1);
    const v2 = local_index.get(g2);
    const v3 = local_index.get(g3);

    if (v1 === undefined || v2 === undefined || v3 === undefined) {
      throw new Error('vertex for partial face was not included in adjacent');
    }

    // @ts-ignore: Microsoft/TypeScript#13288
    return { ...face, vertices: [v1, v2, v3] };
  }

  private partialId(clusters: ClusterId[]) {
    return [this.name, ...clusters].sort().join('#');
  }
}
