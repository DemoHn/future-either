import FutureEither from '../index';
import Future from 'fluture';

describe('mapLeft()', () => {
  let p2 = FutureEither.fromPromise((num: number) => {
    return Promise.reject(new Error(`num error: ${num}`));
  });

  test('should mapLeft the original value correctly', async () => {
    const p = p2(20).toPromiseValue();
    await expect(p).rejects.toThrowError('num error: 20');
  });

  test('should mapLeft the transformed left-value correctly', async () => {
    const p = p2(20)
      .mapLeft(() => new Error('error 01'))
      .mapLeft(() => new Error('error 02'))
      .toPromiseValue();

    await expect(p).rejects.toThrowError('error 02');
  });

  test('should mapLeft the left-value w/o chainRight() interfere', async () => {
    const p = p2(20)
      .mapLeft(() => new Error('error 01'))
      // interfere chainRight()
      .chainRight(() => Future.of(20))
      .chainRight(() => Future.reject(new Error('xxx')))
      .mapLeft(() => new Error('error 02'))
      .toPromiseValue();

    await expect(p).rejects.toThrowError('error 02');
  });

  test('should work only with chainRight()', async () => {
    const p = p2(20)
      .chainRight(() => Future.of(20))
      .chainRight(() => Future.reject(new Error('40')))
      .toPromiseValue();

    await expect(p).rejects.toThrowError('num error: 20');
  });

  test('should reject with error from chainLeft() promise', async () => {
    const p = p2(20)
      .chainLeft(() => Future.reject(new Error('error from left')))
      .mapLeft(() => new Error('error from mapLeft'))
      .toPromiseValue();

    await expect(p).rejects.toThrowError('error from left');
  });
});
