import FutureEither from '../index';
import Future from 'fluture';

describe('Chain()', () => {
  let p2 = FutureEither.fromPromise((num: number) => {
    return Promise.resolve(num);
  });

  test('should chain to another FutureEither instance', async () => {
    const p = p2(20)
      .chain(future => FutureEither.fromFuture(future.map(n => n * n)))
      .toPromiseValue();
    await expect(p).resolves.toEqual(400);
  });

  test('should not interferce from chainRej()', async () => {
    const p = p2(30)
      .chainRej(err => FutureEither.fromFuture(Future.reject(err)))
      .chain(future => FutureEither.fromFuture(future.map(n => n * n)))
      .toPromiseValue();

    await expect(p).resolves.toEqual(900);
  });

  test('should chain a lot of times', async () => {
    const p = p2(20)
      .chain(future => FutureEither.fromFuture(future.map(n => n * n)))
      .chain(future => FutureEither.fromFuture(future.map(n => n / 2)))
      .toPromiseValue();
    await expect(p).resolves.toEqual(200);
  });
});
