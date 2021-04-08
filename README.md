# express-async-context &middot; [![Coverage Status](https://coveralls.io/repos/github/DScheglov/express-async-context/badge.svg?branch=master)](https://coveralls.io/github/DScheglov/express-async-context?branch=master) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DScheglov/express-async-context/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/express-async-context.svg?style=flat-square)](https://www.npmjs.com/package/express-async-context) [![npm downloads](https://img.shields.io/npm/dm/express-async-context.svg?style=flat-square)](https://www.npmjs.com/package/express-async-context)


Zero-dependency context-provision for express-application based on the AsyncLocalStorage.

- [Installation](#installation)
- [Usage](#usage)
- [Motivation](#motivation)
- [API Reference](#api-reference)

## Installation

```shell
npm install express-async-context
```

## Usage

[Live Demo on Sandbox](https://codesandbox.io/s/zealous-wind-ioyix?fontsize=14&hidenavigation=1&initialpath=/trace-id&theme=dark&file=/src/index.ts)

```ts
import express from 'express';
import createContext from 'express-async-context';

const Context = createContext(req => ({
  traceId: req.headers['x-request-id'] ?? Math.random().toFixed(20).slice(2),
}));

const app = express();

app.use(Context.provider);

app.get('/trace-id', Context.consumer(
  (req, res) => ({ traceId }) => res.json({ traceId }),
));

app.listen(8080, () => {
  console.log('Server is listening on port: 8080');
  console.log('Follow: http://localhost:8080/trace-id');
});
```

```shell
curl -H "X-Request-Id: 58895124899023443277" http://localhost:8080/trace-id
```

## Motivation

The `express-async-context` library is designed to aproach context provision to the
chain of request handling in the `express`-application without mutation of the
`request` or/and `response`.

Under the hood library uses [AsyncLocalStorage](https://nodejs.org/api/async_hooks.html#async_hooks_class_asynclocalstorage)
and is based on the [thunk](https://wiki.haskell.org/Thunk#:~:text=A%20thunk%20is%20a%20value,thunk%20unless%20it%20has%20to.)-idiom
that means calculation postponed until it will be provided with the context.

## API Reference

  - [function `createContext`](#function-createcontext)
  - [type `ContextFactory<T>`](#type-contextfactoryt)
  - [interface `ContextManager<T>`](#interface-contextmanagert)
  - [type `HandlerThunk<T>`](#type-handlerthunkt)
  - [type `ErrorHandlerThunk<T>`](#type-errorhandlerthunkt)
  - [type `Thunk<T, R = void>`](#type-thunkt-r--void)
  - [type `RunFn<T>`](#type-runfnt)

### function `createContext`

```typescript
<T>(contextFactory: ContextFactory<T>): ContextManager<T>;
```

Accepts `contextFactory` function and creates a **ContextManager**.

### type `ContextFactory<T>`

```ts
<T>(req: express.Request) => T;
```

The type describes function that accepts `express`.`Request` and returns **context data** of any type `T`.


### interface `ContextManager<T>`

```ts
interface ContextManager<T> {
  provider: (req: express.Request, res: express.Response, next: express.NextFunction) => void;
  consumer: {
    (handler: express.RequestHandler | HandlerThunk<T>): express.RequestHandler;
    (handler: express.ErrorRequestHandler | ErrorHandlerThunk<T>): express.ErrorRequestHandler;
  }
```

The interface contains two members:

 - **provider** - is an usual `express` middleware that creates **context data**
for each request using `contextFactory` and "_binds_" this data to the request

 - **consumer** - is a decorator for `HandlerThunk<T>` and `ErrorHandlerThunk` that converts them
to usual `express.RequestHandler` and `express.ErrorRequestHandler`.

### type `HandlerThunk<T>`

```ts
(req: express.Request, res: express.Response, next: express.NextFunction) =>
  (context: T, run: RunFn<T>) => void;
```

The curried request handler that requires two-times application.

`HandlerThunk` could be considered as an `express`.`RequestHandler` 
that returns a postponed handling of the request -- the `Thunk`

### type `ErrorHandlerThunk<T>`

```ts
(err: any, req: express.Request, res: express.Response, next: express.NextFunction) => 
  (context: T, run: RunFn<T>) => void;
```

The curried handler of error trhown during the request processing.

`ErrorHandlerThunk` could be considered as an `express`.`ErrorRequestHandler` that
returns a postponed handling of the error -- the `Thunk`

### type `Thunk<T, R = void>`

```ts
(context: T, run: RunFn<T>) => R
```

The postponed calculation, including handler of the request or an error.
The correspondent function receives **context data** and the `run`-function,
that runs any other `Thunk`.

### type `RunFn<T>`

```ts
<R>(fn: Thunk<T, R>) => R
```

Runs and injects the **context data** and itself to the postponed calculation
that accepts as a single argument. 

`RunFn` returns the result of execution of its argument-function.