declare module "kd-tree-javascript" {
  // TODO generic keys
  export type Point = {
    x: number;
    y: number;
    z: number;
  };

  type DistanceFunction = (a: Point, b: Point) => number;
  type Dimensions = string[];

  export class kdTree<P extends Point> {
    constructor(
      points: P[],
      distance: DistanceFunction,
      dimensions: Dimensions
    );

    nearest(point: Point, nearest: number): P[][];
  }
}
