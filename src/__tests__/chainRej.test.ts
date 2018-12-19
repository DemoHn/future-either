import FutureEither, { FutureEitherInstance } from '../index';
import Future from 'fluture';

// TODO: redesign this test suite in the future since the payload is so strange!
describe('ChainRej()', () => {
  let p2 = FutureEither.fromFuture(Future.reject('fake error')).chainLeft(() => Future.reject(new Error('error01')));

  test('should chainRej to another FutureEither instance', async () => {
    const p = p2
      .chainRej(e => FutureEither.fromFuture(Future.reject(new Error(e.toString() + '_01'))))
      .toPromiseValue();
    await expect(p).rejects.toThrowError('error01_01');
  });

  test('should not interferce from chain()', async () => {
    const p = p2
      .chainRej(err => FutureEither.fromFuture(Future.reject(err)))
      .chain(future => FutureEither.fromFuture(future))
      .toPromiseValue();

    await expect(p).rejects.toThrowError('error01');
  });

  test('should chainRej a lot of times', async () => {
    const feWithErrorFunc = (e: Error) =>
      FutureEither.fromFuture(Future.reject('fake error')).chainLeft(() =>
        Future.reject(new Error(e.toString() + '_01')),
      );
    const p = p2
      .chainRej(feWithErrorFunc)
      .chainRej(feWithErrorFunc)
      .toPromiseValue();
    await expect(p).rejects.toThrowError('Error: Error: error01_01_01');
  });
});
