"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FaceMesh_1 = require("../mesh/FaceMesh");
const bbox_1 = require("../math/bbox");
class Cluster {
    constructor(vertices, faces, name) {
        this.faces = faces;
        this.vertices = vertices;
        this.name = name;
        this.adjacent = new Set();
        this.adjacent_included = new Set();
        for (const face of this.faces) {
            face.adjacent_clusters.forEach(adjacent => this.adjacent.add(adjacent));
        }
    }
    addVertex(vertex) {
        this.vertices.push(vertex);
    }
    addFace(face) {
        this.faces.push(face);
    }
    computeBbox() {
        return bbox_1.default(this.vertices, vertex => vertex.p);
    }
    toMesh() {
        // GlobalVertexId => VertexId
        const local_index = new Map();
        // reindex global indices to local
        this.vertices.forEach(({ vertex_id }, i) => {
            local_index.set(vertex_id, i);
        });
        // reindex global indices to local
        const faces = this.completeFaces().map(face => {
            return Object.assign({}, face, { vertices: face.vertices.map(global_vertex_id => local_index.get(global_vertex_id)) });
        });
        return new FaceMesh_1.default(this.vertices, faces);
    }
    toMeshWithAdjacent(adjacents) {
        const local_index = new Map();
        // reindex global indices to local
        const vertices = this.vertices.map((vertex, i) => {
            local_index.set(vertex.vertex_id, i);
            return vertex;
        });
        const faces = this.completeFaces().map(face => {
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
        const partials_loaded = new Set();
        for (const face of this.partialFaces()) {
            partials_loaded.add(this.partialId(face.adjacent_clusters));
            faces.push(this.mapGlobalLocal(face, local_index));
        }
        // TODO: simplify by adding global face id to ooc
        // now that all vertices are loaded also add the faces that are shared
        // between adjacent clusters
        for (const adjacent of adjacents) {
            // the partial ids that are loaded with through this adjacent
            const new_partials_loaded = new Set();
            for (const face of adjacent.partialFaces()) {
                const partial_id = adjacent.partialId(face.adjacent_clusters);
                // wheather this face is only shared either with other adjacents
                const shared_with_adjacents = face.adjacent_clusters.every(corner_adjacent => adjacents.find(other => other.name === corner_adjacent) !==
                    undefined);
                if (!partials_loaded.has(partial_id) && shared_with_adjacents) {
                    faces.push(this.mapGlobalLocal(face, local_index));
                    new_partials_loaded.add(partial_id);
                }
            }
            for (const new_partial_loaded of new_partials_loaded) {
                partials_loaded.add(new_partial_loaded);
            }
        }
        return new FaceMesh_1.default(vertices, faces);
    }
    completeFaces() {
        return this.faces.filter(face => face.adjacent_clusters.every(cluster_id => this.adjacent_included.has(cluster_id)));
    }
    partialFaces() {
        return this.faces.filter(face => face.adjacent_clusters.some(cluster_id => !this.adjacent_included.has(cluster_id)));
    }
    writeableFaces() {
        return this.faces;
    }
    clusterNeeded(cluster_id) {
        return (this.adjacent.has(cluster_id) && !this.adjacent_included.has(cluster_id));
    }
    /**
     *
     * @param face
     * @param local_index
     * @return F face with only local indices
     */
    mapGlobalLocal(face, local_index) {
        const [g1, g2, g3] = face.vertices;
        const v1 = local_index.get(g1);
        const v2 = local_index.get(g2);
        const v3 = local_index.get(g3);
        if (v1 === undefined || v2 === undefined || v3 === undefined) {
            throw new Error('vertex for partial face was not included in adjacent');
        }
        // @ts-ignore: Microsoft/TypeScript#13288
        return Object.assign({}, face, { vertices: [v1, v2, v3] });
    }
    partialId(clusters) {
        return [this.name, ...clusters].sort().join('#');
    }
}
exports.default = Cluster;
