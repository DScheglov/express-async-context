import { throwTypeError } from './throwTypeError';

describe('throwTypeError', () => {
  it('throws a TypeError with specified message', () => {
    expect(() => throwTypeError('Some Error')).toThrow(
      new TypeError('Some Error'),
    );
  });
});
