# future-either

## Overview

`FutureEither` is an extension of the original `Future<L, R>` data type from [fluture](https://github.com/fluture-js/Fluture). It intends to control the flow of a tri-state object that contains `E`, `L`, `R` state. The definition of those states are stated as follows:

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

`TODO`