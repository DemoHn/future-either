import { FutureInstance } from 'fluture'
import * as Future from 'fluture'

type FutureEitherType<L, R> = FutureInstance<{}, FutureInstance<L, R>>


export class FutureEitherInstance<L, R> {
  futureEither: FutureEitherType<L, R>

  constructor(futureEither: FutureEitherType<L, R>) {
    this.futureEither = futureEither
  }

  chainLeft<V>(mapper: (a: L) => FutureInstance<{}, V>): FutureEitherInstance<V, R> {
    return new FutureEitherInstance(
      this.futureEither.chain(
        fe => fe
          // @ts-ignore
          .chain(rv => Future.of(Future.of(rv)))
          // @ts-ignore
          .chainRej(lv => mapper(lv)
            .chain((v: V) => Future.of(Future.reject(v)))
            .chainRej((e: {}) => Future.reject(e))
          )
      )
    )
  }

  chainRight<V>(mapper: (a: R) => FutureInstance<{}, V>): FutureEitherInstance<L, V> {
    return new FutureEitherInstance(
      this.futureEither.chain(
        fe => fe
          // @ts-ignore
          .chainRej(lv => Future.of(Future.reject(lv)))
          // @ts-ignore
          .chain(rv => mapper(rv)
            .chain((v: V) => Future.of(Future.of(v)))
            .chainRej((e: {}) => Future.reject(e))
          )
      )
    )
  }

  toPromiseValue<R>(): Promise<R> {
    return this.futureEither
      .chain(m => {
        console.log('chain================', m)
        return Future.of(m)
      })
      .chainRej(r => {
        console.log('rej ==================', r)
        return Future.reject(r)
      })
      // @ts-ignore
      .chain<R>(fe => fe)
      .promise()
  }
}

export default {
  fromPromise<L, R, A>(fn: (a: A) => Promise<R>): (a: A) => FutureEitherInstance<L, R> {
    const futureP = Future.encaseP<L, R, A>(fn)

    return (a: A) => new FutureEitherInstance(
      Future.of(futureP(a))
    )
  },
}