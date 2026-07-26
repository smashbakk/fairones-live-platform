import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { AccessToken, TrackSource } from 'livekit-server-sdk';

export type JoinRole = 'viewer' | 'speaker' | 'host';
export type JoinRequest = { roomName?: unknown; displayName?: unknown; role?: unknown; speakerGrant?: unknown };

export type TokenServiceConfig = {
  serverUrl: string;
  apiKey: string;
  apiSecret: string;
  allowedRooms: Set<string>;
  tokenTtl: string;
  adminKey?: string;
  speakerGrantSecret?: string;
};

export class TokenRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export function loadTokenServiceConfig(environment: NodeJS.ProcessEnv = process.env): TokenServiceConfig {
  const serverUrl = environment.LIVEKIT_URL?.trim();
  const apiKey = environment.LIVEKIT_API_KEY?.trim();
  const apiSecret = environment.LIVEKIT_API_SECRET?.trim();
  if (!serverUrl || !apiKey || !apiSecret) throw new Error('LiveKit server configuration is incomplete.');
  const allowedRooms = new Set((environment.LIVEKIT_ALLOWED_ROOMS || 'fairones-main-event,fairones-live-lobby').split(',').map((room) => room.trim()).filter(Boolean));
  return { serverUrl, apiKey, apiSecret, allowedRooms, tokenTtl: environment.LIVEKIT_TOKEN_TTL || '10m', adminKey: environment.FAIRONES_ADMIN_KEY, speakerGrantSecret: environment.FAIRONES_SPEAKER_GRANT_SECRET };
}

export function validateJoinRequest(body: JoinRequest, config: TokenServiceConfig): { roomName: string; displayName: string; role: JoinRole; speakerGrant?: string } {
  const roomName = typeof body.roomName === 'string' ? body.roomName.trim() : '';
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
  const role: JoinRole = body.role === 'host' ? 'host' : body.role === 'speaker' ? 'speaker' : 'viewer';
  const speakerGrant = typeof body.speakerGrant === 'string' ? body.speakerGrant.trim() : undefined;
  if (!config.allowedRooms.has(roomName)) throw new TokenRequestError('This livestream room is not available.', 403);
  if (!displayName || displayName.length > 60) throw new TokenRequestError('Display name must contain 1–60 characters.', 400);
  if (!/^[\p{L}\p{N} ._'-]+$/u.test(displayName)) throw new TokenRequestError('Display name contains unsupported characters.', 400);
  if (role === 'speaker' && roomName !== 'fairones-live-lobby') throw new TokenRequestError('Subscriber speaking is limited to the audio lobby.', 403);
  return { roomName, displayName, role, speakerGrant };
}

export function authorizeHost(role: JoinRole, providedKey: string | null, configuredKey?: string): void {
  if (role !== 'host') return;
  if (!providedKey || !configuredKey) throw new TokenRequestError('Host authorization is required.', 403);
  const provided = Buffer.from(providedKey); const configured = Buffer.from(configuredKey);
  if (provided.length !== configured.length || !timingSafeEqual(provided, configured)) throw new TokenRequestError('Host authorization is invalid.', 403);
}

function decodeBase64Url(value: string): string { return Buffer.from(value, 'base64url').toString('utf8'); }

export function authorizeSpeaker(role: JoinRole, grant: string | undefined, secret?: string): void {
  if (role !== 'speaker') return;
  if (!grant || !secret) throw new TokenRequestError('Verified FairOnesLive subscription is required to speak.', 403);
  const [payloadPart, signaturePart] = grant.split('.');
  if (!payloadPart || !signaturePart) throw new TokenRequestError('Subscriber verification has expired. Verify again.', 403);
  const expected = createHmac('sha256', secret).update(payloadPart).digest();
  const provided = Buffer.from(signaturePart, 'base64url');
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) throw new TokenRequestError('Subscriber verification is invalid.', 403);
  let payload: { sub?: boolean; exp?: number };
  try { payload = JSON.parse(decodeBase64Url(payloadPart)); } catch { throw new TokenRequestError('Subscriber verification is invalid.', 403); }
  if (payload.sub !== true || !payload.exp || payload.exp < Date.now()) throw new TokenRequestError('Subscriber verification has expired. Verify again.', 403);
}

export async function issueJoinCredentials(body: JoinRequest, adminKey: string | null, config: TokenServiceConfig) {
  const request = validateJoinRequest(body, config);
  authorizeHost(request.role, adminKey, config.adminKey);
  authorizeSpeaker(request.role, request.speakerGrant, config.speakerGrantSecret);
  const identity = `${request.role}-${randomUUID()}`;
  const accessToken = new AccessToken(config.apiKey, config.apiSecret, { identity, name: request.displayName, ttl: config.tokenTtl, metadata: JSON.stringify({ role: request.role, platform: 'fairones-live' }) });
  const canPublish = request.role === 'host' || request.role === 'speaker';
  accessToken.addGrant({
    roomJoin: true,
    room: request.roomName,
    canSubscribe: true,
    canPublish,
    canPublishData: request.role === 'host',
    canPublishSources: request.role === 'speaker' ? [TrackSource.MICROPHONE] : undefined,
  });
  return { serverUrl: config.serverUrl, participantToken: await accessToken.toJwt(), roomName: request.roomName, identity, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() };
}
