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
          .map(rv => Future.of(rv))
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
          // swap(): to prevent F<{}, F<L, {}>> affected .chain() flow which should NOT be executed at all!
          .chainRej(lv => Future.of(Future.reject(lv)).swap())
          // @ts-ignore
          .chain(rv => mapper(rv)
            .chain((v: V) => Future.of(Future.of(v)))
            .chainRej((e: {}) => Future.reject(e))
            .swap()
          )
          .swap()
      )
    )
  }

  toValue(): FutureInstance<L, R> {
    // @ts-ignore
    return this.futureEither.chain(fe => fe)
  }

  toPromiseValue<R>(): Promise<R> {
    return this.futureEither
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