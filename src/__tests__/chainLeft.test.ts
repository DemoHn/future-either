import FutureEither from '../index'
import Future from 'fluture'

describe('chainLeft()', () => {
  let p2 = FutureEither.fromPromise((num: number) => {
    return Promise.reject(new Error(`num error: ${num}`))
  })

  test('should reject the original value correctly', async () => {
    const p = p2(20)
      .toPromiseValue()
    await expect(p).rejects.toThrowError('num error: 20')
  })

  test('should reject the transformed left-value correctly', async () => {
    const p = p2(20)
      .chainLeft(() => Future.of(new Error('error 01')))
      .chainLeft(() => Future.of(new Error('error 02')))
      .toPromiseValue()

    await expect(p).rejects.toThrowError('error 02')
  })

  // TODO: how to pass this test?
  test('should reject the left-value w/o chainRight() interfere', async () => {
    const p = p2(20)
      .chainLeft(() => Future.of(new Error('error 01')))
      // interfere chainRight()
      .chainRight(() => Future.of(20))
      .chainRight(() => Future.reject(new Error('xxx')))
      .chainLeft(() => Future.of(new Error('error 02')))
      .toPromiseValue()

    await expect(p).rejects.toThrowError('error 02')
  })
})