/* Integration check: forgot-password flow (manual local check, not a Jest test) */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { DataSource } = require('typeorm');

const BASE = process.env.TEST_API_URL || 'http://localhost:3004';
const EMAIL = `test-forgot-${Date.now()}@example.com`;
const PASSWORD = 'OldPass123!';

async function post(p, body) {
  const res = await fetch(BASE + p, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

async function main() {
  console.log('Test email:', EMAIL);

  console.log('\n=== 1. Register ===');
  const reg = await post('/auth/register', { email: EMAIL, password: PASSWORD, name: 'Test User' });
  console.log('Status:', reg.status, 'Body:', JSON.stringify(reg.body).slice(0, 200));

  console.log('\n=== 2. Login (old password) ===');
  const login1 = await post('/auth/login', { email: EMAIL, password: PASSWORD });
  console.log('Status:', login1.status, 'has token:', !!login1.body?.access_token);

  console.log('\n=== 3. Forgot password ===');
  const forgot = await post('/auth/forgot-password', { email: EMAIL });
  console.log('Status:', forgot.status, 'Body:', JSON.stringify(forgot.body));

  console.log('\n=== 4. Verify code stored in DB ===');
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await ds.initialize();
  const rows = await ds.query(
    'SELECT email, "passwordResetCode" IS NOT NULL AS has_code, "passwordResetExpires" FROM "user" WHERE email = $1',
    [EMAIL]
  );
  console.log(JSON.stringify(rows, null, 2));

  console.log('\n=== 5. Reset with wrong code ===');
  const badReset = await post('/auth/reset-password', { email: EMAIL, code: '000000', newPassword: 'NewPass456!' });
  console.log('Status:', badReset.status, 'Body:', JSON.stringify(badReset.body));

  console.log('\n=== 6. Forgot for non-existent email (anti-enum) ===');
  const fake = await post('/auth/forgot-password', { email: 'no-such-user-' + Date.now() + '@example.com' });
  console.log('Status:', fake.status, 'Body:', JSON.stringify(fake.body));

  console.log('\n=== 7. Cleanup ===');
  await ds.query('DELETE FROM "user" WHERE email = $1', [EMAIL]);
  console.log('Deleted test user');
  await ds.destroy();
  console.log('\nDone');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
