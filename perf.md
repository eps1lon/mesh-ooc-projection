# 0e6d3b07bfdce668fa8e89cf8961afb989143e91 src/node/index
- low_poly: `EisriesenweltSegmentationVisualization.off`

## laptop
unclean (i.e. did some other stuff), more of a ballpark
```
read_low_poly: 1236.229ms
kdTree: 1569.897ms
```
- high_poly: .off conversion of the following .ply
  | file | #vertices | size | time |
  |---|---|
  | EisriesenWelt10PercentD12 | 2,791,552 | 246 MB | 132.8s |
  | EisriesenWelt10PercentD13 | 11,015,412 | 885MB | 451.312s |
  | EisriesenWelt10PercentD14 | 37,669,180 | 3181MB | |  

## E069
```
read_low_poly: 706.665ms
kdTree: 778.045ms
```
- high_poly: .off conversion of the following .ply
  | file | #vertices | size | time |
  |---|---|
  | EisriesenWelt10PercentD12 | 2,791,552 | 246 MB | 97.86s |
  | EisriesenWelt10PercentD13 | 11,015,412 | 885MB | 337.968s |
  | EisriesenWelt10PercentD14 | 37,669,180 | 3181MB | ? |  

# 17a311797bc79974642f32e44433773de956926e 
## npm run project:regular 
### ../tmp/eisriesenwelt/EisriesenWelt10PercentD12.off
#### 300
```bash
$ npm run project:regular -- ../tmp/eisriesenwelt/EisriesenWelt10PercentD12.off 300
bbox: 10614.645ms
vertex_pass: 68004.809ms
face_pass: 50380.420ms
```
- max file:size: 4.5MB
- min file_size: <1KB
#### 50
```bash
$ npm run project:regular -- ../tmp/eisriesenwelt/EisriesenWelt10PercentD12.off 50
bbox: 11711.267ms
vertex_pass: 49823.176ms
face_pass: 59731.139ms
```
- max file:size: 22.7MB
- min file_size: <1KB

## npm run project:regular:snapshot
### with grid res 50 on 0,0,0
- with adjacent: 9116 17917 0
- w/o adjacent: 8818 17336 0

## Tooling
https://github.com/thlorenz/v8-perf/issues/4
