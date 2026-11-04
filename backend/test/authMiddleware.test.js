const test = require('node:test');
const assert = require('node:assert/strict');
const { requireAuth, requireRole } = require('../src/middleware/auth');

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('rejects protected requests without a bearer token', async () => {
  const response = createResponse();
  await requireAuth({ get: () => undefined }, response, (error) => { throw error; });
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
});

test('rejects role-restricted actions for users without an allowed role', () => {
  const response = createResponse();
  const next = () => assert.fail('next should not be called for a forbidden role');
  requireRole('admin')({ user: { role: 'assistant' } }, response, next);
  assert.equal(response.statusCode, 403);
});

test('allows an authorized role to continue', () => {
  let continued = false;
  requireRole('admin')({ user: { role: 'admin' } }, createResponse(), () => { continued = true; });
  assert.equal(continued, true);
});
