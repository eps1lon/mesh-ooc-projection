"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// cli tool used to evaluate the segment indices display under
// ExperimentalResults > projection
/* tslint:disable: no-console */
const argparse_1 = require("argparse");
const path = require("path");
const segmentation_1 = require("../segmentation");
const parser = new argparse_1.ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: 'aggregates count of segment indices, -1 => chamber, -2 => undefined'
});
parser.addArgument(['--indices-file'], {
    help: 'path to low poly .off file',
    required: true
});
const args = parser.parseArgs();
const indices_file = path.join(process.cwd(), args.indices_file);
segmentation_1.load(indices_file)
    .then(indices => {
    const aggregate = new Map();
    for (const index of indices) {
        const prev_count = aggregate.get(index) || 0;
        aggregate.set(index, prev_count + 1);
    }
    console.log('index \t count \t rel');
    for (const [index, count] of [...aggregate.entries()].sort(
    // by segment index
    (a, b) => a[0] - b[0])) {
        console.log(`${index} \t ${count} \t ${count / indices.length * 100}`);
    }
})
    .catch(err => {
    console.error(err);
});
