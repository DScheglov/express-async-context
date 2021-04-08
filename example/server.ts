import express from 'express';
import createContext from '../src';

const Context = createContext(req => ({
  traceId: req.headers['x-request-id'] ?? Math.random().toFixed(20).slice(2),
}));

const app = express();

app.use(Context.provider);

app.get('/trace-id', Context.consumer(
  (req, res) => ({ traceId }) => res.json({ traceId }),
));

app.use(Context.consumer(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err, req, res, next) => ({ traceId }) => {
    console.log(`${traceId}:`, err.message);
    res.status(500).json({ error: err.message });
  },
));

app.listen(8080, () => {
  console.log('Server is listening on port: 8080');
  console.log('Follow: http://localhost:8080/trace-id');
});
