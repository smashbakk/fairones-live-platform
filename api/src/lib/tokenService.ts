import { randomUUID, timingSafeEqual } from 'node:crypto';
import { AccessToken } from 'livekit-server-sdk';

export type JoinRole = 'viewer' | 'host';
export type JoinRequest = { roomName?: unknown; displayName?: unknown; role?: unknown };

export type TokenServiceConfig = {
  serverUrl: string;
  apiKey: string;
  apiSecret: string;
  allowedRooms: Set<string>;
  tokenTtl: string;
  adminKey?: string;
};

export class TokenRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export function loadTokenServiceConfig(environment: NodeJS.ProcessEnv = process.env): TokenServiceConfig {
  const serverUrl = environment.LIVEKIT_URL?.trim();
  const apiKey = environment.LIVEKIT_API_KEY?.trim();
  const apiSecret = environment.LIVEKIT_API_SECRET?.trim();
  if (!serverUrl || !apiKey || !apiSecret) throw new Error('LiveKit server configuration is incomplete.');

  const allowedRooms = new Set((environment.LIVEKIT_ALLOWED_ROOMS || 'fairones-main-event').split(',').map((room) => room.trim()).filter(Boolean));
  return { serverUrl, apiKey, apiSecret, allowedRooms, tokenTtl: environment.LIVEKIT_TOKEN_TTL || '10m', adminKey: environment.FAIRONES_ADMIN_KEY };
}

export function validateJoinRequest(body: JoinRequest, config: TokenServiceConfig): { roomName: string; displayName: string; role: JoinRole } {
  const roomName = typeof body.roomName === 'string' ? body.roomName.trim() : '';
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
  const role = body.role === 'host' ? 'host' : 'viewer';

  if (!config.allowedRooms.has(roomName)) throw new TokenRequestError('This livestream room is not available.', 403);
  if (!displayName || displayName.length > 60) throw new TokenRequestError('Display name must contain 1–60 characters.', 400);
  if (!/^[\p{L}\p{N} ._'-]+$/u.test(displayName)) throw new TokenRequestError('Display name contains unsupported characters.', 400);
  return { roomName, displayName, role };
}

export function authorizeHost(role: JoinRole, providedKey: string | null, configuredKey?: string): void {
  if (role !== 'host') return;
  if (!providedKey || !configuredKey) throw new TokenRequestError('Host authorization is required.', 403);
  const provided = Buffer.from(providedKey);
  const configured = Buffer.from(configuredKey);
  if (provided.length !== configured.length || !timingSafeEqual(provided, configured)) throw new TokenRequestError('Host authorization is invalid.', 403);
}

export async function issueJoinCredentials(body: JoinRequest, adminKey: string | null, config: TokenServiceConfig) {
  const request = validateJoinRequest(body, config);
  authorizeHost(request.role, adminKey, config.adminKey);
  const identity = `${request.role}-${randomUUID()}`;
  const accessToken = new AccessToken(config.apiKey, config.apiSecret, {
    identity,
    name: request.displayName,
    ttl: config.tokenTtl,
    metadata: JSON.stringify({ role: request.role, platform: 'fairones-live' }),
  });
  accessToken.addGrant({
    roomJoin: true,
    room: request.roomName,
    canSubscribe: true,
    canPublish: request.role === 'host',
    canPublishData: request.role === 'host',
  });

  return {
    serverUrl: config.serverUrl,
    participantToken: await accessToken.toJwt(),
    roomName: request.roomName,
    identity,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
}
