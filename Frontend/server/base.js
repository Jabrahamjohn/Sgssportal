import cookie from 'cookie';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import * as yup from 'yup';

// ****** ENVS Start ********

dotenv.config();

export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',');
export const API_AUTH_LIMITER_EXPIRES =
  process.env.API_AUTH_LIMITER_EXPIRES && !isNaN(+process.env.API_AUTH_LIMITER_EXPIRES)
    ? +process.env.API_AUTH_LIMITER_EXPIRES
    : 3600;
export const API_AUTH_LIMITER_MAX =
  process.env.API_AUTH_LIMITER_MAX && !isNaN(+process.env.API_AUTH_LIMITER_MAX)
    ? +process.env.API_AUTH_LIMITER_MAX
    : 50;
export const API_DEFAULT_LIMITER_EXPIRES =
  process.env.API_DEFAULT_LIMITER_EXPIRES && !isNaN(+process.env.API_DEFAULT_LIMITER_EXPIRES)
    ? +process.env.API_DEFAULT_LIMITER_EXPIRES
    : 900;
export const API_DEFAULT_LIMITER_MAX =
  process.env.API_DEFAULT_LIMITER_MAX && !isNaN(+process.env.API_DEFAULT_LIMITER_MAX)
    ? +process.env.API_DEFAULT_LIMITER_MAX
    : 10;
export const AUTH_KEY = process.env.AUTH_KEY || 'nrGgtPY';
export const CSRF_TOKEN = process.env.CSRF_TOKEN || 'X-Csrf-Token';
export const CSRF_TOKEN_EXPIRES =
  process.env.CSRF_TOKEN_EXPIRES && !isNaN(+process.env.CSRF_TOKEN_EXPIRES)
    ? +process.env.CSRF_TOKEN_EXPIRES
    : undefined;
export const NODE_ENV = process.env.NODE_ENV;
export const SECRET_KEY = process.env.SECRET_KEY || 'mrhqpzfUCPLie3537e7ebb5f58e';
export const JWT_EXPIRES =
  process.env.JWT_EXPIRES && !isNaN(+process.env.JWT_EXPIRES) ? +process.env.JWT_EXPIRES : 14400;
export const PREVENT_CACHE_ON_GET_AUTH_USER = +process.env.PREVENT_CACHE_ON_GET_AUTH_USER === 0 ? false : true;
export const TEST_MODE = +process.env.TEST_MODE === 1;

// ****** ENVS Stop *********

const ERROR_CODES = {
  ERROR_CSRF_100: {
    code: 'ERROR_CSRF_100',
    message: 'Unable to validate CSRF TOKEN. Please refresh this page and try again.',
  },
};

const baseRouter = express.Router();

// Apply Helmet middleware first for maximum protection
baseRouter.use(helmet());

// ****** CORS Start ********

// Configure CORS options
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || ALLOWED_ORIGINS.length === 0) return callback(null, true);
    // Allow if the origin is in our allowed list
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  credentials: true, // This is crucial for sending cookies and custom headers
};

// Apply the CORS middleware with your custom options
baseRouter.use(cors(corsOptions));

// ****** CORS Stop  ********

// ****** Rate Limiter Start *******

function keyGenerator(req, _) {
  if (!req.ip) {
    if (TEST_MODE) console.error('Warning: request.ip is missing!');
    return req.socket.remoteAddress;
  }

  return req.ip.replace(/:\d+[^:]*$/, '');
}

// Limiter for sensitive authentication routes
const authLimiter = rateLimit({
  windowMs: API_AUTH_LIMITER_EXPIRES * 1000, // 15 minutes
  limit: API_AUTH_LIMITER_MAX, // Max 10 requests per IP per window
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
  statusCode: 429,
  keyGenerator,
});

// Limiter for general API data fetching
const apiLimiter = rateLimit({
  windowMs: API_DEFAULT_LIMITER_EXPIRES * 1000, // 1 hour
  limit: API_DEFAULT_LIMITER_MAX, // Max 100 requests per IP per hour
  message: {
    status: 'error',
    message: 'You have exceeded the API request limit. Please try again later.',
  },
  statusCode: 429,
  keyGenerator,
});

// ******** Rate Limiter Stop *********

// API route for health
baseRouter.get('/api/health/', apiLimiter, healthController);

// API route for saving the token
baseRouter.post('/api/auth/login/', apiLimiter, verifyCSRFTokenMiddleware, loginController);

// API route for removing the token
baseRouter.post('/api/auth/logout/', apiLimiter, verifyCSRFTokenMiddleware, logoutController);

// API route for retrieving the token
baseRouter.get('/api/auth/user/', authLimiter, authUserController);

// ********** Validators Start ************

// Schema for the login credentials coming from your React frontend
export const loginRequestSchema = yup.object({
  credentials: yup
    .object({
      token: yup.string().required('Token is required'),
      user: yup.object().required('User object is required.'),
    })
    .required('Credentials are required.'),
});

// ********** Validators Stop *************

// ********** Controllers Start ***********

// // Controller to check if the backend server is live
export async function healthController(req, res) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');

    // Add CSRF_TOKEN IF NOT PRESENT
    const csrfToken = cookies[CSRF_TOKEN];
    if (!csrfToken) generateCsrfTokenInResponse(res);
    else res.setHeader(CSRF_TOKEN, csrfToken);

    res.status(200).json({
      status: 'success',
      message: 'Health is Good',
      data: { ip: TEST_MODE ? req.ip : undefined },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: TEST_MODE && error.message ? error.message : 'Something went wrong on the client server.',
    });
  }
}

// // Login Controller
export async function loginController(req, res) {
  try {
    const { credentials } = await loginRequestSchema.validate({ ...req.body }, { abortEarly: true });

    const token = jwt.sign(credentials, SECRET_KEY, {
      expiresIn: JWT_EXPIRES,
    });

    // Add CSRF_TOKEN
    generateCsrfTokenInResponse(res, token);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: TEST_MODE && error.message ? error.message : 'Something went wrong on the client server.',
    });
  }
}

// // Logout Controller
export async function logoutController(_, res) {
  try {
    // Add CSRF_TOKEN
    generateCsrfTokenInResponse(res, null);

    res.status(200).json({ status: 'success', message: 'Token removed successfully' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Something went wrong on the client server.',
    });
  }
}

// // Auth User Controller
export async function authUserController(req, res) {
  try {
    if (PREVENT_CACHE_ON_GET_AUTH_USER) {
      // Prevent netlify from caching this endpoint
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies[AUTH_KEY];

    // Add CSRF_TOKEN IF NOT PRESENT
    const csrfToken = cookies[CSRF_TOKEN];
    if (!csrfToken) generateCsrfTokenInResponse(res);
    else res.setHeader(CSRF_TOKEN, csrfToken);

    if (token) {
      const decoded = jwt.verify(token, SECRET_KEY);
      if (!decoded || !decoded.token) {
        res.status(401).json({
          success: 'error',
          message: 'Authentication credentials are invalid',
        });
      } else {
        const { iat, exp, ...data } = decoded;

        res.status(200).json({
          status: 'success',
          message: 'Authentication credentials verified',
          data: { ...data, csrfToken },
        });
      }
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Authentication credentials were not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Something went wrong on the client server.',
    });
  }
}

// ********** Controllers Stop ************

// ********** Middlewares Start ************

// // verify CSRF_TOKEN middleware
export function verifyCSRFTokenMiddleware(req, res, next) {
  try {
    // Get the token from the cookies
    const cookies = cookie.parse(req.headers.cookie || '');
    const cookieCsrfToken = cookies[CSRF_TOKEN];

    // Get the token from the request headers
    const headerCsrfToken = req.header(CSRF_TOKEN);

    if (!headerCsrfToken || !cookieCsrfToken) {
      res.status(403).json({
        errorCode: ERROR_CODES.ERROR_CSRF_100.code,
        status: 'error',
        message: ERROR_CODES.ERROR_CSRF_100.message + ' Token is not present in headers or cookies.',
      });
      return;
    }

    // Check they are both the same
    if (headerCsrfToken !== cookieCsrfToken) {
      res.status(403).json({
        errorCode: ERROR_CODES.ERROR_CSRF_100.code,
        status: 'error',
        message: ERROR_CODES.ERROR_CSRF_100.message + 'CSRF Token is not valid.',
      });
      return;
    }

    // continue
    next();
  } catch (error) {
    res.status(500).json({
      errorCode: ERROR_CODES.ERROR_CSRF_100.code,
      status: 'error',
      message:
        TEST_MODE && error.message
          ? error.message
          : ERROR_CODES.ERROR_CSRF_100.message + ' Something went wrong on the client server.',
    });
  }
}

// ********** Middlewares Stop *************

// ********** Utils Start ************

// Function to generate a random token
export function generateCsrfToken() {
  // Generate 32 random bytes and convert to a hex string
  return crypto.randomBytes(32).toString('hex');
}

// Function to generate a CSRF token and place in the response headers
// if auth token is passed in then set the auth header
export function generateCsrfTokenInResponse(res, token) {
  const csrfToken = generateCsrfToken();
  res.setHeader(CSRF_TOKEN, csrfToken);

  const cookies = [
    cookie.serialize(CSRF_TOKEN, csrfToken, {
      expires: CSRF_TOKEN_EXPIRES ? new Date(Date.now() + CSRF_TOKEN_EXPIRES * 1000) : undefined,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: NODE_ENV !== 'development',
    }),
  ];
  if (token) {
    cookies.push(
      cookie.serialize(AUTH_KEY, token, {
        expires: new Date(Date.now() + JWT_EXPIRES * 1000),
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        secure: NODE_ENV !== 'development',
      })
    );
  } else if (token === null) {
    cookies.push(
      cookie.serialize(AUTH_KEY, '', {
        expires: new Date(0),
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        secure: NODE_ENV !== 'development',
      })
    );
  }

  res.setHeader('Set-Cookie', cookies);
}

// ********** Utils Stop *************

// // Export Final
export const router = baseRouter;
