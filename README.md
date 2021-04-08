# express-async-context

## Install

```shell
npm install express-async-context
```

## Usage

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

## API Reference

```shell
npm test
```