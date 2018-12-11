import FutureEither from '../index';
import Future from 'fluture';

describe('Right-Value', () => {
  // generate a resolved Promise as a Right-Value
  let p1 = FutureEither.fromPromise((num: number) => {
    return Promise.resolve(num);
  });

  test('should resolve original value', async () => {
    const p = p1(20).toPromiseValue();

    await expect(p).resolves.toEqual(20);
  });
  test('should resolve value correctly', async () => {
    const testValue = 20;

    const p = p1(testValue)
      .chainRight((n: number) => Future.of(n * n))
      .toPromiseValue();

    await expect(p).resolves.toEqual(400);
  });

  test('should resolve value correctly /cascade', async () => {
    const testValue = 30;

    const p = p1(testValue)
      .chainRight((n: number) => Future.of(n * 2))
      .chainRight((n: number) => Future.of(n + 20))
      .toPromiseValue();

    await expect(p).resolves.toEqual(80);
  });

  test('should resolve value correctly /chainLeft() would not interferce', async () => {
    const testValue = 30;

    const p = p1(testValue)
      .chainRight((n: number) => Future.of(n * 2))
      .chainLeft(() => Future.of(new Error('error')))
      .chainRight((n: number) => Future.of(n / 2))
      .chainLeft(() => Future.of(new Error('error2')))
      .chainRight((n: number) => Future.of(n * 3))
      .toPromiseValue();

    await expect(p).resolves.toEqual(testValue * 3);
  });

  test('should reject due to error', async () => {
    const testValue = 30;
    const p = p1(testValue)
      .chainRight(n => Future.of(n))
      .chainRight(() => Future.reject(new Error('err01')))
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
      .chainLeft(() => Future.of('Hello World'))
      .chainLeft(() => Future.of(new Error('Hello World again')))
      .toPromiseValue();

    await expect(p).resolves.toEqual(testValue);
  });
});
