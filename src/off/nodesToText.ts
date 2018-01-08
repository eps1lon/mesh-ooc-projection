import {
  Face,
  Format,
  Meta,
  Node,
  Vertex,
  ColoredVertex,
  isColoredVertex
} from './nodes';

export default function toText(node: Node): string {
  switch (node.type) {
    case 'vertex':
      return vertex(node);
    case 'face':
      return face(node);
    case 'format':
      return format(node);
    case 'meta':
      return meta(node);
  }
}

function vertex(vertex_node: ColoredVertex | Vertex): string {
  const { x, y, z } = vertex_node;
  let line = [x, y, z].join(' ');

  if (isColoredVertex(vertex_node)) {
    const { r, g, b } = vertex_node.color;
    line = `${line} ${[r, g, b].join(' ')}`;
  }

  return line;
}

function face({ vertices }: Face) {
  return `${vertices.length} ${vertices.join(' ')}`;
}

function format(node: Format) {
  return node.format;
}

function meta({ vertex_count, face_count, edge_count }: Meta) {
  return [vertex_count, face_count, edge_count].join(' ');
}
