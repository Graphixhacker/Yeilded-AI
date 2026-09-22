import express, { Request, Response, NextFunction } from 'express';
import { apiRouter } from '../server/apiRouter.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS & Preflight Handling for Vercel Serverless
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', (req.headers.origin as string) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', runtime: 'vercel-serverless', timestamp: new Date().toISOString() });
});
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', runtime: 'vercel-serverless', timestamp: new Date().toISOString() });
});

// Mount the API Router on both '/api' and '/' to seamlessly handle rewritten and direct routes
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
