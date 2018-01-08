// cli tool used to evaluate the segment indices display under
// ExperimentalResults > projection
/* tslint:disable: no-console */
import { ArgumentParser } from 'argparse';
import * as path from 'path';

import { load } from '../segmentation';

const parser = new ArgumentParser({
  version: '1.0.0',
  addHelp: true,
  description:
    'aggregates count of segment indices, -1 => chamber, -2 => undefined'
});

parser.addArgument(['--indices-file'], {
  help: 'path to low poly .off file',
  required: true
});

const args = parser.parseArgs();

const indices_file = path.join(process.cwd(), args.indices_file);

load(indices_file)
  .then(indices => {
    const aggregate = new Map<number, number>();

    for (const index of indices) {
      const prev_count = aggregate.get(index) || 0;

      aggregate.set(index, prev_count + 1);
    }

    console.log('index \t count \t rel');
    for (const [index, count] of [...aggregate.entries()].sort(
      // by segment index
      (a, b) => a[0] - b[0]
    )) {
      console.log(`${index} \t ${count} \t ${count / indices.length * 100}`);
    }
  })
  .catch(err => {
    console.error(err);
  });
