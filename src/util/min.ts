// python styled min
export default function min<T>(
  items: Iterable<T>,
  value: (item: T) => number
): T {
  let min_item: T | undefined;
  let min_value = Number.POSITIVE_INFINITY;

  for (const item of items) {
    const cur_value = value(item);
    if (cur_value < min_value || min_item === undefined) {
      min_value = cur_value;
      min_item = item;
    }
  }

  if (min_item === undefined) {
    throw new Error('iterator was empty');
  }

  return min_item;
}
