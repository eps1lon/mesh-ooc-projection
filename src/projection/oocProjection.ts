/* tslint:disable: no-console */
import project from './project';
import { writeBack } from '../cluster/ooc/writeRegular';
import OocClustersRegular from '../cluster/ooc/OocClustersRegular';
import { inBbox } from '../hierarchies/kdTree';
import { normalize, scalarMul, sub, add } from '../math/vector';
import FaceMesh from '../mesh/FaceMesh';
import faceMeshToHalfEdge from '../mesh/faceMeshToHalfEdge';
import withNormals from '../mesh/withNormals';
import { initIndices, UNDEFINED_INDEX } from '../segmentation';

// 0 means we just look into the cluster bbox
// 1 means we add max-min to both sides
const BBOX_SCALE_DELTA = +(process.env.BBOX_SCALE_DELTA || 0.1);

export default async function oocProjection(
  low_res_mesh: FaceMesh,
  low_res_indices: Int32Array,
  clusters: OocClustersRegular
): Promise<Int32Array> {
  console.time('read_ooc');

  // output segmentindices
  const projected_indices = initIndices(clusters.num_vertices);

  if (low_res_mesh.vertices.length !== low_res_indices.length) {
    throw new Error(
      'number of vertices in mesh is not equal to number of indices'
    );
  }

  console.time('low_poly_normals');
  const base_mesh = withNormals(low_res_mesh);
  // normalize vertex normals and add segment index
  base_mesh.vertices.forEach((vertex, id) => {
    vertex.normal = normalize(vertex.normal);
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
    const delta = scalarMul(
      BBOX_SCALE_DELTA,
      sub(cluster_bbox.max, cluster_bbox.min)
    );
    const bbox_query = {
      min: sub(cluster_bbox.min, delta),
      max: add(cluster_bbox.max, delta)
    };
    const face_candidates = inBbox(low_poly_query, bbox_query);
    console.timeEnd('face_candidates');

    console.time('build_half_edge_structure');
    const high_res_face_mesh = cluster.toMeshWithAdjacent(adjacent_clusters);
    const high_res_mesh = faceMeshToHalfEdge(high_res_face_mesh);
    console.timeEnd('build_half_edge_structure');

    console.time('projection');
    const painted = project(high_res_mesh, face_candidates, face =>
      base_mesh.faceVertices(face)
    );
    console.timeEnd('projection');

    console.log(`painted ${painted} vertices`);

    console.time('writeBack');
    await Promise.all(
      writeable_clusters.map(writeable => {
        // save indices in core
        writeable.saveAttribute(
          projected_indices,
          vertex =>
            vertex.attributes.segment === undefined
              ? UNDEFINED_INDEX
              : vertex.attributes.segment
        );

        return writeBack(writeable, clusters.dir);
      })
    );
    console.timeEnd('writeBack');
  }
  console.timeEnd('read_ooc');

  console.log(
    `${projected_indices.filter(index => index !== UNDEFINED_INDEX).length}/ ${
      projected_indices.length
    } vertices have a defined segment index`
  );

  return projected_indices;
}
