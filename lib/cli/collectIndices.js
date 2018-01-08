"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// cli tool to collect segment indices into single buffer from ooc dir
/* tslint:disable: no-console */
const argparse_1 = require("argparse");
const path = require("path");
const segmentation_1 = require("../segmentation");
const loadRegular_1 = require("../cluster/ooc/loadRegular");
const util_1 = require("./util");
const fs_1 = require("../util/fs");
const parser = new argparse_1.ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: 'collectes indices from our ooc structure'
});
parser.addArgument(['--indices-file'], {
    help: 'output path',
    required: true
});
parser.addArgument(['--ooc-dir'], {
    help: 'out-of-core directory',
    required: true
});
parser.addArgument(['--vertex-count'], {
    help: 'number of vertices in out-of-core structre',
    required: true
});
const args = parser.parseArgs();
const indices_file = path.join(process.cwd(), args.indices_file);
const ooc_dir = path.join(process.cwd(), args.ooc_dir);
const indices = segmentation_1.initIndices(args.vertex_count);
fs_1.readdir(ooc_dir).then(async (cluster_files) => {
    const progress = util_1.createProgress(cluster_files.length);
    for (const cluster_file of cluster_files) {
        const cluster = await loadRegular_1.default(path.join(ooc_dir, cluster_file));
        for (const vertex of cluster.vertices) {
            const segment_index = vertex.attributes.segment;
            indices[vertex.vertex_id] =
                segment_index === undefined ? segmentation_1.UNDEFINED_INDEX : segment_index;
        }
        progress();
    }
    return segmentation_1.write(indices_file, indices);
});
