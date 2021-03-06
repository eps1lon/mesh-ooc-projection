"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable: no-console */
const argparse_1 = require("argparse");
const glob = require("glob");
const path = require("path");
const util_1 = require("./util");
const loadRegular_1 = require("../cluster/ooc/loadRegular");
const writeMesh_1 = require("../off/writeMesh");
const parser = new argparse_1.ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: 'creates an off snapshot of the specified ooc structure'
});
parser.addArgument(['-f', '--file'], {
    help: 'path to ooc cluster file',
    required: true
});
parser.addArgument(['--include-partial'], {
    help: 'include faces that reach into adjacent clusters',
    action: 'storeTrue'
});
parser.addArgument(['--include-adjacent'], {
    help: 'include adjacent clusters',
    action: 'storeTrue'
});
const args = parser.parseArgs();
args.include_partial = args.include_partial && !args.include_adjacent;
const load = args.include_partial ? loadRegular_1.loadWithAdjacent : loadRegular_1.default;
const cwd = process.cwd();
glob(args.file, { cwd }, async (err, files) => {
    if (err) {
        throw err;
    }
    const progress = util_1.createProgress(files.length);
    const ooc_dir = path.dirname(path.join(cwd, args.file));
    for (const file of files) {
        const cluster_filename = path.join(cwd, file);
        const ext = path.extname(file);
        const cluster = await load(cluster_filename);
        let mesh;
        if (args.include_adjacent) {
            console.log(`stitch ${[...cluster.adjacent]}`);
            mesh = cluster.toMeshWithAdjacent(await Promise.all([...cluster.adjacent].map(id => load(path.join(ooc_dir, `${id}${ext}`)))));
        }
        else {
            mesh = cluster.toMesh();
        }
        const out_file = `${cluster_filename}.${args.include_adjacent ? 'a.' : ''}${args.include_partial ? 'p.' : ''}off`;
        await writeMesh_1.default(mesh, out_file);
        progress();
    }
});
