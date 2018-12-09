import FutureEither, { FutureEitherInstance } from '../index'
import Future from 'fluture'

describe('future-either', () => {
  test('beginning test', async () => {
    const d = await Future.of(Future.of(12))
      .chain(fe => fe.chainRej(v => {
        console.log(v)
        return Future.reject(24)
      }))
      .promise()
  })

  test('should return data', async () => {
    const p = FutureEither.fromPromise((num: number) => Promise.resolve(num))

    await expect(p(40)
      // multiply
      .chainRight((n: number) => Future.of(n * n))
      //.chainRight((n: number) => Future.of(n * 2))
      .chainLeft(() => Future.of(300))
      .toPromiseValue()).resolves.toEqual(1600)
  })
})