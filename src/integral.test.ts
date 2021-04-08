import request from 'supertest';
import express, { NextFunction, Request, Response } from 'express';
import alsContext from '.';
import mixinContext from './mixin';

describe.each([
  ['alsContext', alsContext],
  ['mixinContext', mixinContext],
])('App using %s', (_, createContext) => {
  const Context = createContext(req => ({ traceId: req.headers['x-request-id']! }));

  const app = express()
    .use(Context.provider)
    .get('/trace-id', Context.consumer((req, res) => ({ traceId }) => res.json({ traceId })))
    .post('/error', (res, req, next) => next(new Error('Error')))
    .use(Context.consumer(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (err: Error, req: Request, res: Response, next: NextFunction) => ({ traceId }) => {
        console.log(`${traceId}:`, err.message);
        res.status(500).json({ error: err.message });
      },
    ));

  it('responds with 200 { traceId } on GET /trace-id', async () => {
    expect.assertions(1);

    const res = await request(app)
      .get('/trace-id')
      .set('x-request-id', '1')
      .send()
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toEqual({ traceId: '1' });
  });

  it('responds with 500 { error: "Error" } on POST /error. the error should be logged', async () => {
    expect.assertions(3);

    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    log.mockReset();
    const res = await request(app)
      .post('/error')
      .set('x-request-id', '2')
      .send()
      .expect('Content-Type', /json/)
      .expect(500);

    expect(res.body).toEqual({ error: 'Error' });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('2:', 'Error');
  });
});
