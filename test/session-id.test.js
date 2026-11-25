'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const {
    SESSION_ID_PREFIX,
    createSessionId,
    decodeSessionId,
    getSessionIdNumber,
    restoreSessionId,
} = require('../lib/session-id');

const tempRoots = [];
function tempDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'meshtech-session-id-'));
    tempRoots.push(dir);
    return dir;
}

test.afterEach(() => {
    for (const dir of tempRoots.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function makeSessionId(number, files) {
    const canonicalFiles = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
    const checksum = crypto.createHash('sha256').update(JSON.stringify(canonicalFiles)).digest('hex');
    const payload = { version: 2, number, files: canonicalFiles, checksum };
    return SESSION_ID_PREFIX + zlib.gzipSync(Buffer.from(JSON.stringify(payload))).toString('base64url');
}

function encodedFile(value) {
    return Buffer.from(value).toString('base64');
}

test('exports and restores a complete auth directory without changing file bytes', () => {
    const root = tempDir();
    const authDir = path.join(root, 'auth');
    fs.mkdirSync(path.join(authDir, 'keys'), { recursive: true });
    const creds = JSON.stringify({ registered: true, me: { id: '254700000001@s.whatsapp.net' } });
    const keyData = JSON.stringify({ key: 'value', counter: 4 });
    fs.writeFileSync(path.join(authDir, 'creds.json'), creds);
    fs.writeFileSync(path.join(authDir, 'keys', 'sender-key.json'), keyData);

    const sessionId = createSessionId(authDir, '+254 700 000 001');
    assert.ok(sessionId.startsWith(SESSION_ID_PREFIX));
    assert.equal(getSessionIdNumber(sessionId), '254700000001');
    assert.deepEqual(decodeSessionId(sessionId).number, '254700000001');

    const restoredDir = path.join(root, 'restored');
    const result = restoreSessionId(sessionId, restoredDir, '254700000001');
    assert.equal(result.fileCount, 2);
    assert.equal(fs.readFileSync(path.join(restoredDir, 'creds.json'), 'utf8'), creds);
    assert.equal(fs.readFileSync(path.join(restoredDir, 'keys', 'sender-key.json'), 'utf8'), keyData);
    assert.equal(fs.statSync(path.join(restoredDir, 'creds.json')).mode & 0o777, 0o600);
});

test('rejects recovery IDs whose embedded credentials identify another phone number', () => {
    const id = makeSessionId('254700000001', {
        'creds.json': encodedFile(JSON.stringify({ registered: true, me: { id: '254700000002:5@s.whatsapp.net' } })),
    });
    assert.throws(() => decodeSessionId(id), /Auth credentials belong to 254700000002/);
});
test('refuses to import a session for a different WhatsApp account', () => {
    const root = tempDir();
    const id = makeSessionId('254700000001', {
        'creds.json': encodedFile(JSON.stringify({ registered: true })),
    });
    const target = path.join(root, 'auth');
    assert.throws(() => restoreSessionId(id, target, '254700000002'), /belongs to 254700000001/);
    assert.equal(fs.existsSync(target), false);
});

test('refuses to overwrite existing auth data', () => {
    const root = tempDir();
    const id = makeSessionId('254700000001', {
        'creds.json': encodedFile(JSON.stringify({ registered: true })),
    });
    const target = path.join(root, 'auth');
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'keep.txt'), 'preserve');
    assert.throws(() => restoreSessionId(id, target, '254700000001'), /Refusing to overwrite/);
    assert.equal(fs.readFileSync(path.join(target, 'keep.txt'), 'utf8'), 'preserve');
});

test('rejects traversal paths before creating the target directory', () => {
    const root = tempDir();
    const id = makeSessionId('254700000001', {
        'creds.json': encodedFile(JSON.stringify({ registered: true })),
        '../outside.txt': encodedFile('nope'),
    });
    const target = path.join(root, 'auth');
    assert.throws(() => restoreSessionId(id, target, '254700000001'), /invalid file path/);
    assert.equal(fs.existsSync(target), false);
    assert.equal(fs.existsSync(path.join(root, 'outside.txt')), false);
});

test('rejects noncanonical base64 and tampered bundle integrity', () => {
    const invalidBase64 = makeSessionId('254700000001', {
        'creds.json': encodedFile(JSON.stringify({ registered: true })),
        'keys/key.json': 'not*base64',
    });
    assert.throws(() => decodeSessionId(invalidBase64), /invalid base64/);

    const valid = makeSessionId('254700000001', {
        'creds.json': encodedFile(JSON.stringify({ registered: true })),
    });
    const tampered = valid.slice(0, -2) + (valid.endsWith('aa') ? 'bb' : 'aa');
    assert.throws(() => decodeSessionId(tampered));
});

test('rejects incomplete, unregistered, and legacy session IDs', () => {
    const unregistered = makeSessionId('254700000001', {
        'creds.json': encodedFile(JSON.stringify({ registered: false })),
    });
    assert.throws(() => decodeSessionId(unregistered), /not contain a registered/);
    assert.throws(() => decodeSessionId('MeshTech~v1~old-token'), /legacy V2.5/);
    assert.equal(createSessionId(path.join(tempDir(), 'missing'), '254700000001'), null);
});
