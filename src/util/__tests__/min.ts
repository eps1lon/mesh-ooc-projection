/// <reference types="@types/node" />
/// <reference types="@types/jest" />
import min from '../min';

it('should select the value with the minimum value from fn', () => {
  const items = ['first', 'second', 'third'];

  expect(min(items, item => item.length)).toBe('first');
});
