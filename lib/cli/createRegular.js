"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable: no-console */
const argparse_1 = require("argparse");
const path = require("path");
const createRegular_1 = require("../cluster/ooc/createRegular");
const parser = new argparse_1.ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: 'create a out-of-core data structure using a uniform grid'
});
parser.addArgument(['-f', '--file'], {
    help: 'path to .off file',
    required: true
});
parser.addArgument(['-r', '--res'], {
    help: 'number of clusters along longest axis',
    required: true,
    type: 'int'
});
parser.addArgument(['-o', '--ooc-dir'], {
    help: 'path to directory where ooc files should reside',
    required: true
});
const args = parser.parseArgs();
const file = path.join(process.cwd(), args.file);
const ooc_dir = path.join(process.cwd(), args.ooc_dir);
const grid_res = args.res; // res_arg x res_arg x res_arg
createRegular_1.default(file, ooc_dir, grid_res).then(clusters => {
    console.log('------', [...clusters.allClusters()].length, '<=', grid_res ** 3);
});
