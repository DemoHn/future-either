import FutureEither from '../index';
import Future from 'fluture';

describe('mapRight()', () => {
  // generate a resolved Promise as a Right-Value
  let p1 = FutureEither.fromPromise((num: number) => {
    return Promise.resolve(num);
  });

  test('should resolve original value', async () => {
    const p = p1(20).toPromiseValue();

    await expect(p).resolves.toEqual(20);
  });
  test('should map new value', async () => {
    const testValue = 20;

    const p = p1(testValue)
      .mapRight((n: number) => n * n)
      .toPromiseValue();

    await expect(p).resolves.toEqual(400);
  });

  test('should map value correctly /cascade', async () => {
    const testValue = 30;

    const p = p1(testValue)
      .mapRight((n: number) => n * 2)
      .mapRight((n: number) => n + 20)
      .toPromiseValue();

    await expect(p).resolves.toEqual(80);
  });

  test('should map value correctly /chainLeft(), mapLeft() would not interferce', async () => {
    const testValue = 30;

    const p = p1(testValue)
      .mapRight((n: number) => n * 2)
      .chainLeft(() => Future.of(new Error('error')))
      .mapRight((n: number) => n / 2)
      .chainLeft(() => Future.of(new Error('error2')))
      .mapLeft(e => new Error(e.toString() + '_tag'))
      .mapRight((n: number) => n * 3)
      .toPromiseValue();

    await expect(p).resolves.toEqual(testValue * 3);
  });

  test('should not map after failed', async () => {
    const testValue = 30;
    const p = p1(testValue)
      .mapRight(n => n)
      .chainRight(() => Future.reject(new Error('err01')))
      // @ts-ignore
      .mapRight(n => n + n)
      .chainRight(() => Future.reject(new Error('err02')))
      .toPromiseValue();

    await expect(p).rejects.toThrowError('err01');
  });

  test('should do resolve values before reject', async () => {
    const testValue = 30;
    const p = p1(testValue)
      .chainRight((n: number) => Future.of(n * 3))
      .chainLeft(() => Future.of(new Error('err left')))
      .chainRight((n: number) => Future.reject(new Error('n = ' + n)))
      .toPromiseValue();

    await expect(p).rejects.toThrowError('n = 90');
  });

  test('ensure leftValue() not work on a right-value at all!', async () => {
    const testValue = 30;

    const p = p1(testValue)
      .mapLeft(() => 'Hello World')
      .chainLeft(() => Future.of(new Error('Hello World again')))
      .mapLeft(() => new Error('Hello World again'))
      .toPromiseValue();

    await expect(p).resolves.toEqual(testValue);
  });
});
