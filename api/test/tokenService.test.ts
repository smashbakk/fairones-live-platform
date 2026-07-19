import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizeHost, issueJoinCredentials, TokenRequestError, TokenServiceConfig, validateJoinRequest } from '../src/lib/tokenService';

const config: TokenServiceConfig = {
  serverUrl: 'wss://fairones.example.test',
  apiKey: 'key',
  apiSecret: 'secret',
  allowedRooms: new Set(['fairones-main-event']),
  tokenTtl: '10m',
  adminKey: 'correct-horse-battery-staple',
};

test('accepts an allowed viewer room', () => {
  assert.deepEqual(validateJoinRequest({ roomName: 'fairones-main-event', displayName: 'Viewer 1', role: 'viewer' }, config), {
    roomName: 'fairones-main-event', displayName: 'Viewer 1', role: 'viewer',
  });
});

test('rejects rooms outside the server allowlist', () => {
  assert.throws(() => validateJoinRequest({ roomName: 'someone-else-room', displayName: 'Viewer' }, config), (error) => error instanceof TokenRequestError && error.status === 403);
});

test('requires the configured secret for host publishing', () => {
  assert.throws(() => authorizeHost('host', 'wrong-key', config.adminKey), (error) => error instanceof TokenRequestError && error.status === 403);
  assert.doesNotThrow(() => authorizeHost('host', config.adminKey!, config.adminKey));
});

test('viewer tokens never require the host secret', () => {
  assert.doesNotThrow(() => authorizeHost('viewer', null, config.adminKey));
});

test('viewer token can subscribe but cannot publish', async () => {
  const credentials = await issueJoinCredentials({ roomName: 'fairones-main-event', displayName: 'Viewer', role: 'viewer' }, null, config);
  const claims = JSON.parse(Buffer.from(credentials.participantToken.split('.')[1]!, 'base64url').toString()) as { video: { canSubscribe: boolean; canPublish: boolean; canPublishData: boolean } };
  assert.equal(claims.video.canSubscribe, true);
  assert.equal(claims.video.canPublish, false);
  assert.equal(claims.video.canPublishData, false);
});

test('authorized host token can publish', async () => {
  const credentials = await issueJoinCredentials({ roomName: 'fairones-main-event', displayName: 'Host', role: 'host' }, config.adminKey!, config);
  const claims = JSON.parse(Buffer.from(credentials.participantToken.split('.')[1]!, 'base64url').toString()) as { video: { canPublish: boolean; canPublishData: boolean } };
  assert.equal(claims.video.canPublish, true);
  assert.equal(claims.video.canPublishData, true);
});
