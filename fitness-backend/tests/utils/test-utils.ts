/**
 * Test Utilities
 * Common helpers for API testing with Supertest
 */
import request, { Response } from 'supertest';
import { Express } from 'express';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/utils/jwt';

// Cached app instance
let app: Express;

/**
 * Get or create app instance for testing
 */
export const getTestApp = (): Express => {
  if (!app) {
    app = createApp();
  }
  return app;
};

/**
 * Generate auth token for testing
 */
export const generateTestToken = (
  userId: number = 1,
  email: string = 'test@example.com',
  role: string = 'user'
): string => {
  return generateAccessToken({ userId, email, role });
};

/**
 * Make authenticated request
 */
export const authRequest = (method: 'get' | 'post' | 'patch' | 'put' | 'delete', path: string, token?: string) => {
  const testToken = token || generateTestToken();
  const app = getTestApp();
  
  return request(app)
    [method](`/api/v1${path}`)
    .set('Authorization', `Bearer ${testToken}`)
    .set('Content-Type', 'application/json');
};

/**
 * Make unauthenticated request
 */
export const publicRequest = (method: 'get' | 'post' | 'patch' | 'put' | 'delete', path: string) => {
  const app = getTestApp();
  return request(app)
    [method](`/api/v1${path}`)
    .set('Content-Type', 'application/json');
};

// Convenience methods for authenticated requests
export const authGet = (path: string, token?: string) => authRequest('get', path, token);
export const authPost = (path: string, token?: string) => authRequest('post', path, token);
export const authPatch = (path: string, token?: string) => authRequest('patch', path, token);
export const authPut = (path: string, token?: string) => authRequest('put', path, token);
export const authDelete = (path: string, token?: string) => authRequest('delete', path, token);

// Convenience methods for public requests
export const publicGet = (path: string) => publicRequest('get', path);
export const publicPost = (path: string) => publicRequest('post', path);

/**
 * Assert successful JSON response
 */
export const expectSuccess = (res: Response, statusCode: number = 200) => {
  expect(res.status).toBe(statusCode);
  expect(res.body).toHaveProperty('success', true);
  return res.body;
};

/**
 * Assert error response
 */
export const expectError = (res: Response, statusCode: number, message?: string) => {
  expect(res.status).toBe(statusCode);
  expect(res.body).toHaveProperty('success', false);
  if (message) {
    expect(res.body.error).toContain(message);
  }
  return res.body;
};

/**
 * Assert 401 Unauthorized
 */
export const expectUnauthorized = (res: Response) => expectError(res, 401);

/**
 * Assert 403 Forbidden
 */
export const expectForbidden = (res: Response) => expectError(res, 403);

/**
 * Assert 404 Not Found
 */
export const expectNotFound = (res: Response) => expectError(res, 404);

/**
 * Assert 400 Bad Request
 */
export const expectBadRequest = (res: Response, message?: string) => expectError(res, 400, message);

/**
 * Assert 409 Conflict
 */
export const expectConflict = (res: Response, message?: string) => expectError(res, 409, message);

/**
 * Assert validation error (400 with validation details)
 */
export const expectValidationError = (res: Response) => {
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('success', false);
  return res.body;
};

/**
 * Assert paginated response structure
 */
export const expectPaginated = (res: Response, itemsKey: string = 'data') => {
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
  expect(res.body).toHaveProperty(itemsKey);
  expect(Array.isArray(res.body[itemsKey])).toBe(true);
  expect(res.body).toHaveProperty('pagination');
  expect(res.body.pagination).toHaveProperty('page');
  expect(res.body.pagination).toHaveProperty('limit');
  expect(res.body.pagination).toHaveProperty('total');
  return res.body;
};

/**
 * Wait for async operations (useful in some cases)
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create test headers with custom values
 */
export const createHeaders = (token?: string, extras?: Record<string, string>) => ({
  Authorization: token ? `Bearer ${token}` : undefined,
  'Content-Type': 'application/json',
  ...extras,
});
