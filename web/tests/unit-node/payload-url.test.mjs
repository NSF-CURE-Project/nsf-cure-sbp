import test from 'node:test';
import assert from 'node:assert/strict';

const ORIGINAL_ENV = { ...process.env };

const loadModule = async () => import(`../../src/lib/payloadSdk/payloadUrl.ts?cacheBust=${Date.now()}-${Math.random()}`);

const setWindow = (value) => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value,
  });
};

test.afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  setWindow(undefined);
});

test('uses rewrite path in development browser runtime', async () => {
  process.env.NODE_ENV = 'development';
  setWindow({});
  const { getPayloadBaseUrl } = await loadModule();
  assert.equal(getPayloadBaseUrl(), '');
});

test('prefers PAYLOAD_URL on server runtime', async () => {
  process.env.NODE_ENV = 'production';
  process.env.PAYLOAD_URL = 'https://cms.example.edu';
  process.env.NEXT_PUBLIC_PAYLOAD_URL = 'https://public.example.edu';
  setWindow(undefined);
  const { getPayloadBaseUrl } = await loadModule();
  assert.equal(getPayloadBaseUrl(), 'https://cms.example.edu');
});

test('falls back to localhost in production server runtime with missing env vars', async () => {
  process.env.NODE_ENV = 'production';
  delete process.env.PAYLOAD_URL;
  delete process.env.PAYLOAD_PROXY_TARGET;
  delete process.env.NEXT_PUBLIC_PAYLOAD_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  setWindow(undefined);
  const { getPayloadBaseUrl } = await loadModule();
  assert.equal(getPayloadBaseUrl(), 'http://localhost:3000');
});
