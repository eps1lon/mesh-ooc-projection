# Production
The release pages in gitlab and the digital version of this thesis
include binaries for linux and windows which include a node runtime.

# Development
## Requirements
- [Node 9.3](https://nodejs.org/download/release/v9.3.0/) (includes npm)

## Install
```bash
$ npm install
```

# Usage
## main
combines creation of out-of-core structure and projection logic

```bash
$PATH_TO_BINARY/main --help
usage: main [-h] [-v] --low-poly-file LOW_POLY_FILE --high-poly-file
            HIGH_POLY_FILE --grid-resolution-max GRID_RESOLUTION_MAX --ooc-dir
            OOC_DIR --indices-file INDICES_FILE
Projects color and segment indices of a low resolution mesh to a high resolutin mesh using an out-of-core data structure. The projected segment indices will be saved in the same directory  as the low resolution indices suffixed with .out.

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show programs version number and exit.
  --low-poly-file LOW_POLY_FILE
                        path to low poly .off file
  --high-poly-file HIGH_POLY_FILE
                        path to high poly .off file
  --grid-resolution-max GRID_RESOLUTION_MAX
                        max number of clusters along longest axis
  --ooc-dir OOC_DIR     path to directory where ooc files should reside
  --indices-file INDICES_FILE
                        path to low res indices file
Environment variables:
# At what percentage of the mesh we throw in region growing
$ export REGION_UPPER_BOUND = 0.5
# how far away from the root cluster we further look for faces in low poly (in %)
$ export BBOX_SCALE_DELTA = 0.1
```

## out-of-core structure creation
```bash
$PATH_TO_BINARY/createRegular --help
usage: createRegular [-h] [-v] -f FILE -r RES -o OOC_DIR

write ooc data structure as regular grid

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show programs version number and exit.
  -f FILE, --file FILE  path to .off file
  -r RES, --res RES     number of clusters along longest axis
  -o OOC_DIR, --ooc-dir OOC_DIR
                        path to directory where ooc files should reside
```

## projection
```bash
$PATH_TO_BINARY/projectRegular --help
usage: projectRegular [-h] [-v] -f FILE -i INDICES_FILE --high-poly-vertices
                      HIGH_POLY_VERTICES -r RES -o OOC_DIR


write ooc data structure as regular grid

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show programs version number and exit.
  -f FILE, --file FILE  path to low res .off file
  -i INDICES_FILE, --indices-file INDICES_FILE
                        path to low res indices file
  --high-poly-vertices HIGH_POLY_VERTICES
                        number of vertices in high poly
  -r RES, --res RES     number of clusters along longest axis
  -o OOC_DIR, --ooc-dir OOC_DIR
                        path to directory with ooc files
Environment variables:
# At what percentage of the mesh we throw in region growing
$ export REGION_UPPER_BOUND = 0.5
# how far away from the root cluster we further look for faces in low poly (in %)
$ export BBOX_SCALE_DELTA = 0.1
```

# notes about typescript
For readers unfamiliar with TypeScript I will try to explain some basics aobut
language specific syntax, semantics and general usage.

TypeScript is a type superset of JavaScript which means that it supports every
language feature of JavaScript. The `src/` directory contains files written in
TypeScript and have the extesion `.ts`. 

Syntax and semantics should be familiar for readers that have experience in C
style languages. The use of functional paradigms was avoided as much as possible
to not confuse unfamiliar readers and avoid memory overhead introduced by this
paradigm.

The source files are compiled (or rather transpiled) to JavaScript 
(specifically the EcmaScript 6 language specification). The type checking is
performed at compile time. The compiled files are emitted to the `lib/` directory
and can from there be executed within a node or browser environment.

`bin/` (in the digital version or in gitlab release page; not included in the repository) 
contains binaries of cli tools necessary for the given task and are documented 
in the usage section of this file. 

`lib/cli` contains additional tools used during development. They are not 
documented any further but should contain argument descriptions.