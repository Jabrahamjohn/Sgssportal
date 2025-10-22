import express from 'express';
import ServerlessHttp from 'serverless-http';
import { router } from '../../server/base.js';

const serverlessApp = express();

// envs
export const TRUST_PROXY = process.env.TRUST_PROXY && !isNaN(+process.env.TRUST_PROXY) ? +process.env.TRUST_PROXY : 0;

// Rate Limiter
serverlessApp.set('trust proxy', TRUST_PROXY);

// Middleware
serverlessApp.use(express.json());

serverlessApp.use(router);

const handler = ServerlessHttp(serverlessApp);

export { handler };
