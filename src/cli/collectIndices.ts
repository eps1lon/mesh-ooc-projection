// cli tool to collect segment indices into single buffer from ooc dir
/* tslint:disable: no-console */
import { ArgumentParser } from 'argparse';
import * as path from 'path';

import { initIndices, write, UNDEFINED_INDEX } from '../segmentation';
import loadRegular from '../cluster/ooc/loadRegular';
import { createProgress } from './util';
import { readdir } from '../util/fs';

const parser = new ArgumentParser({
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

const indices = initIndices(args.vertex_count);

readdir(ooc_dir).then(async cluster_files => {
  const progress = createProgress(cluster_files.length);

  for (const cluster_file of cluster_files) {
    const cluster = await loadRegular(path.join(ooc_dir, cluster_file));

    for (const vertex of cluster.vertices) {
      const segment_index = vertex.attributes.segment;
      indices[vertex.vertex_id] =
        segment_index === undefined ? UNDEFINED_INDEX : segment_index;
    }

    progress();
  }

  return write(indices_file, indices);
});
