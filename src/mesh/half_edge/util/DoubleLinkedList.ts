export interface DoubleLinkedList {
  prev?: DoubleLinkedList;
  next?: DoubleLinkedList;
}
/**
 *
 * @param array
 * @return array_like with list[i].prev = list[i-1]
 */
export function doubleLink<L extends DoubleLinkedList>(array: L[]): L[] {
  for (let i = 1; i < array.length; ++i) {
    array[i].prev = array[i - 1];
    array[i - 1].next = array[i];
  }

  // close circle
  array[0].prev = array[array.length - 1];
  array[array.length - 1].next = array[0];

  return array;
}
