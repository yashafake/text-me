const test = require('node:test');
const assert = require('node:assert/strict');

const { createExternalLinkOpener, normalizeExternalUrl } = require('../external-link-handler');

test('normalizeExternalUrl keeps allowed protocols', () => {
  assert.equal(normalizeExternalUrl('https://example.com'), 'https://example.com/');
  assert.equal(normalizeExternalUrl('http://example.com/path'), 'http://example.com/path');
  assert.equal(normalizeExternalUrl('mailto:test@example.com'), 'mailto:test@example.com');
});

test('normalizeExternalUrl rejects invalid or unsupported protocols', () => {
  assert.equal(normalizeExternalUrl(''), null);
  assert.equal(normalizeExternalUrl('   '), null);
  assert.equal(normalizeExternalUrl('javascript:alert(1)'), null);
  assert.equal(normalizeExternalUrl('file:///tmp/a.txt'), null);
  assert.equal(normalizeExternalUrl('not a url'), null);
  assert.equal(normalizeExternalUrl(null), null);
});

test('createExternalLinkOpener deduplicates same URL in dedupe window', () => {
  const opened = [];
  const opener = createExternalLinkOpener({
    dedupeWindowMs: 1000,
    openExternal: (url) => opened.push(url)
  });

  assert.equal(opener('https://example.com'), true);
  assert.equal(opener('https://example.com'), false);
  assert.deepEqual(opened, ['https://example.com/']);
});

test('createExternalLinkOpener allows same URL after dedupe window', () => {
  const opened = [];
  const opener = createExternalLinkOpener({
    dedupeWindowMs: 200,
    openExternal: (url) => opened.push(url)
  });

  const originalNow = Date.now;
  let now = 1000;
  Date.now = () => now;

  try {
    assert.equal(opener('https://example.com'), true);
    assert.equal(opener('https://example.com'), false);
    now += 250;
    assert.equal(opener('https://example.com'), true);
  } finally {
    Date.now = originalNow;
  }

  assert.deepEqual(opened, ['https://example.com/', 'https://example.com/']);
});

test('createExternalLinkOpener returns false on invalid URL', () => {
  let called = false;
  const opener = createExternalLinkOpener({
    openExternal: () => {
      called = true;
    }
  });

  assert.equal(opener('javascript:alert(1)'), false);
  assert.equal(called, false);
});

test('createExternalLinkOpener returns false when openExternal throws', () => {
  const opener = createExternalLinkOpener({
    openExternal: () => {
      throw new Error('boom');
    }
  });

  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    assert.equal(opener('https://example.com'), false);
  } finally {
    console.error = originalConsoleError;
  }
});
