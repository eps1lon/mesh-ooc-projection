"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable: no-console */
const project_1 = require("./project");
const writeRegular_1 = require("../cluster/ooc/writeRegular");
const kdTree_1 = require("../hierarchies/kdTree");
const vector_1 = require("../math/vector");
const faceMeshToHalfEdge_1 = require("../mesh/faceMeshToHalfEdge");
const withNormals_1 = require("../mesh/withNormals");
const segmentation_1 = require("../segmentation");
// 0 means we just look into the cluster bbox
// 1 means we add max-min to both sides
const BBOX_SCALE_DELTA = +(process.env.BBOX_SCALE_DELTA || 0.1);
async function oocProjection(low_res_mesh, low_res_indices, clusters) {
    console.time('read_ooc');
    // output segmentindices
    const projected_indices = segmentation_1.initIndices(clusters.num_vertices);
    if (low_res_mesh.vertices.length !== low_res_indices.length) {
        throw new Error('number of vertices in mesh is not equal to number of indices');
    }
    console.time('low_poly_normals');
    const base_mesh = withNormals_1.default(low_res_mesh);
    // normalize vertex normals and add segment index
    base_mesh.vertices.forEach((vertex, id) => {
        vertex.normal = vector_1.normalize(vertex.normal);
        vertex.attributes.segment = low_res_indices[id];
    });
    console.timeEnd('low_poly_normals');
    const unprocessed_clusters = [...clusters.allClusters()];
    console.time('build_low_poly_query_interface');
    const low_poly_query = base_mesh.buildKdTree();
    console.timeEnd('build_low_poly_query_interface');
    console.time('read_ooc');
    // clusterStream into flowing
    for (const cluster_id of unprocessed_clusters) {
        console.time('load_cluster');
        const cluster = await clusters.getCluster(cluster_id);
        const adjacent_clusters = await clusters.getAdjacent(cluster);
        const writeable_clusters = [cluster, ...adjacent_clusters];
        console.timeEnd('load_cluster');
        console.log(`digesting cluster '${cluster.name}'`);
        console.time('face_candidates');
        const cluster_bbox = cluster.computeBbox();
        const delta = vector_1.scalarMul(BBOX_SCALE_DELTA, vector_1.sub(cluster_bbox.max, cluster_bbox.min));
        const bbox_query = {
            min: vector_1.sub(cluster_bbox.min, delta),
            max: vector_1.add(cluster_bbox.max, delta)
        };
        const face_candidates = kdTree_1.inBbox(low_poly_query, bbox_query);
        console.timeEnd('face_candidates');
        console.time('build_half_edge_structure');
        const high_res_face_mesh = cluster.toMeshWithAdjacent(adjacent_clusters);
        const high_res_mesh = faceMeshToHalfEdge_1.default(high_res_face_mesh);
        console.timeEnd('build_half_edge_structure');
        console.time('projection');
        const painted = project_1.default(high_res_mesh, face_candidates, face => base_mesh.faceVertices(face));
        console.timeEnd('projection');
        console.log(`painted ${painted} vertices`);
        console.time('writeBack');
        await Promise.all(writeable_clusters.map(writeable => {
            // save indices in core
            writeable.saveAttribute(projected_indices, vertex => vertex.attributes.segment === undefined
                ? segmentation_1.UNDEFINED_INDEX
                : vertex.attributes.segment);
            return writeRegular_1.writeBack(writeable, clusters.dir);
        }));
        console.timeEnd('writeBack');
    }
    console.timeEnd('read_ooc');
    console.log(`${projected_indices.filter(index => index !== segmentation_1.UNDEFINED_INDEX).length}/ ${projected_indices.length} vertices have a defined segment index`);
    return projected_indices;
}
exports.default = oocProjection;
