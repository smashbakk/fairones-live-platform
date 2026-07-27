import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { authorizeHost, authorizeSpeaker, issueJoinCredentials, TokenRequestError, TokenServiceConfig, validateJoinRequest } from '../src/lib/tokenService';

const speakerGrantSecret = 'speaker-grant-secret-for-tests';
const config: TokenServiceConfig = {
  serverUrl: 'wss://fairones.example.test',
  apiKey: 'key',
  apiSecret: 'secret',
  allowedRooms: new Set(['fairones-main-event', 'fairones-live-lobby']),
  tokenTtl: '10m',
  adminKey: 'correct-horse-battery-staple',
  speakerGrantSecret,
};

function makeSpeakerGrant(exp = Date.now() + 60_000): string {
  const payload = Buffer.from(JSON.stringify({ sub: true, exp })).toString('base64url');
  const signature = createHmac('sha256', speakerGrantSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

test('accepts an allowed viewer room', () => {
  assert.deepEqual(validateJoinRequest({ roomName: 'fairones-main-event', displayName: 'Viewer 1', role: 'viewer' }, config), {
    roomName: 'fairones-main-event', displayName: 'Viewer 1', role: 'viewer', speakerGrant: undefined,
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

test('speaker requires a verified subscriber grant', () => {
  assert.throws(() => authorizeSpeaker('speaker', undefined, speakerGrantSecret), (error) => error instanceof TokenRequestError && error.status === 403);
  assert.throws(() => authorizeSpeaker('speaker', makeSpeakerGrant(Date.now() - 1000), speakerGrantSecret), (error) => error instanceof TokenRequestError && error.status === 403);
  assert.doesNotThrow(() => authorizeSpeaker('speaker', makeSpeakerGrant(), speakerGrantSecret));
});

test('speaker is limited to the audio lobby', () => {
  assert.throws(() => validateJoinRequest({ roomName: 'fairones-main-event', displayName: 'Subscriber', role: 'speaker', speakerGrant: makeSpeakerGrant() }, config), (error) => error instanceof TokenRequestError && error.status === 403);
});

test('verified speaker token can publish microphone only', async () => {
  const credentials = await issueJoinCredentials({ roomName: 'fairones-live-lobby', displayName: 'Subscriber', role: 'speaker', speakerGrant: makeSpeakerGrant() }, null, config);
  const claims = JSON.parse(Buffer.from(credentials.participantToken.split('.')[1]!, 'base64url').toString()) as { video: { canSubscribe: boolean; canPublish: boolean; canPublishData: boolean; canPublishSources?: TrackSource[] } };
  assert.equal(claims.video.canSubscribe, true);
  assert.equal(claims.video.canPublish, true);
  assert.equal(claims.video.canPublishData, false);
  assert.deepEqual(claims.video.canPublishSources, ['microphone']);
});
