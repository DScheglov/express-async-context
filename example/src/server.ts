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

app.get('/error', Context.consumer(
  (req, res, next) => ({ traceId }) => {
    console.log(`${traceId}:`, 'Generating an Error');
    next(new Error(`Error in ${traceId}`));
  },
));

app.use(Context.consumer(
  // Express requies error request handler to be 4-arity function,
  // so `next` argument is required even if it is not used

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) =>
    ({ traceId }) => {
      console.error(`${traceId}:`, err.message);
      res.json({ error: err.message });
    },
));

app.listen(8080, () => {
  console.log('Server is listening on port: 8080');
  console.log('Follow: http://localhost:8080/trace-id');
});
