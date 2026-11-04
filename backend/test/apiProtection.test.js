const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'synthetic_test_secret_for_auth_test_only';
const app = require('../server');

let server;
let baseUrl;

before(() => {
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve, reject) => {
  server.close((error) => error ? reject(error) : resolve());
}));

test('patient records require authentication', async () => {
  const response = await fetch(`${baseUrl}/api/patients`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).success, false);
});

test('dashboard summary requires authentication', async () => {
  const response = await fetch(`${baseUrl}/api/dashboard/summary`);
  assert.equal(response.status, 401);
});

test('login rejects an empty credential payload without accessing the database', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 400);
});
