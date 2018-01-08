// object creators for nodes
// similar to AST nodes
export type Node = Vertex | ColoredVertex | Face | Format | Meta;

export interface Vertex {
  type: 'vertex';
  x: number;
  y: number;
  z: number;
}
export function vertex(x: number, y: number, z: number): Vertex {
  return {
    type: 'vertex',
    x,
    y,
    z
  };
}

export interface ColoredVertex extends Vertex {
  color: {
    r: number;
    g: number;
    b: number;
  };
}
export function coloredVertex(
  x: number,
  y: number,
  z: number,
  r: number,
  g: number,
  b: number
): ColoredVertex {
  return {
    ...vertex(x, y, z),
    color: { r, g, b }
  };
}
export function isVertex(node: Node): node is Vertex {
  return node.type === 'vertex';
}
export function isColoredVertex(other: Vertex): other is ColoredVertex {
  return other.hasOwnProperty('color');
}

export interface Face {
  type: 'face';
  vertices: [number, number, number];
}
export function face(a: number, b: number, c: number): Face {
  return {
    type: 'face',
    vertices: [a, b, c]
  };
}
export function isFace(node: Node): node is Face {
  return node.type === 'face';
}

export interface Format {
  type: 'format';
  format: string;
}
export function format(ply_format: string): Format {
  return { type: 'format', format: ply_format };
}
export function isFormat(node: Node): node is Format {
  return node.type === 'format';
}

export interface Meta {
  type: 'meta';
  vertex_count: number;
  face_count: number;
  edge_count: number;
}
export function meta(vertices: number, faces: number, edges: number = 0): Meta {
  return {
    type: 'meta',
    vertex_count: vertices,
    face_count: faces,
    edge_count: edges
  };
}
export function isMeta(node: Node): node is Meta {
  return node.type === 'meta';
}
