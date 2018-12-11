# future-either

## Overview

`FutureEither` is an extension of the original `Future<L, R>` data type from [fluture](https://github.com/fluture-js/Fluture). It intends to control the flow of a tri-state object that contains `E`, `L`, `R` branches. The definition of those branches are stated as follows:

```
  E -> Fatal-Error, should be thrown immediately

  L -> Left-Value, usually for an error but could do side-effects

  R -> Right-Value, returns when succeeded
```

This requirement comes from real coding practice. Take "querying an user from database" as an example. The process may encounter 3 different situations:

- query succeed and data is fetched. 
- query failed because of no such user in database.
- database connection error.

For 1# and 2#, we usually expect further operation  (side-effect) may continue execution according to the results;

For 3#, error should throw immediately.

## API

#### fromPromise

```hs
FutureEither.fromPromise  :: (A -> Promise<R>) -> (A -> FutureEither<E, L, R>)
```
Construct a function that returns a `FutureEither` object from a promise function.

Notice: there will be only `L`, `R` branch of the `FutureEither` object, corresponding to `Promise.reject` and `Promise.resolve` respectively. `E` branch will not happen there.

#### fromP2

```hs
FutureEither.fromP2  :: (A -> B -> Promise<R>) -> (A -> B -> FutureEither<E, L, R>)
```
Similar with `fromPromise`, but with 2 parameters.

#### fromP3

```hs
FutureEither.fromP3  :: (A -> B -> C -> Promise<R>) -> (A -> B -> C -> FutureEither<E, L, R>)
```
Similar with `fromPromise`, but with 3 parameters.

#### chainRight

```hs
FutureEither.prototype.chainRight  :: FutureEither<E, L, R> ~> (R -> Future<E, V>)   -> FutureEither<E, L, V> 
```

Sequence a new `FutureEither` object of the `R` value. It only applies to the `R` branch, that is, `L`, `E` branch will be ignored. 

#### chainLeft

```hs
FutureEither.prototype.chainLeft  :: FutureEither<E, L, R> ~> (L -> Future<E, V>)   -> FutureEither<E, V, R>
```

Sequence a new `FutureEither` object of the `L` value. Similar to `chainRight()`, it only applies to the `L` branch, that is, `R`, `E` branch will be ignored.

#### toValue

```hs
FutureEither.prototype.toValue  :: FutureEither<E, L, R> ~> Future<L, R>
```

Export the future instance with `L` or `R` branch for further operations.

#### toPromiseValue

```hs
FutureEither.prototype.toPromiseValue :: FutureEither<E, L, R> ~> Promise<R>
```

Export the promise object of the future instance. Notice: both `E` and `L` branch will throw error!
