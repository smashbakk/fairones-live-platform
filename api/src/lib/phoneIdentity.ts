import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export class PhoneIdentityError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

type InfobipConfig = {
  baseUrl: string;
  apiKey: string;
  applicationId: string;
  messageId: string;
  signingSecret: string;
};

type ChallengePayload = {
  kind: 'phone-challenge';
  phone: string;
  displayName: string;
  pinId: string;
  exp: number;
};

type IdentityPayload = {
  kind: 'chat-identity';
  phoneHash: string;
  displayName: string;
  exp: number;
};

export function loadInfobipConfig(environment: NodeJS.ProcessEnv = process.env): InfobipConfig {
  const configuredBaseUrl = environment.INFOBIP_BASE_URL?.trim();
  let baseUrl = '';
  if (configuredBaseUrl) {
    try {
      const parsed = new URL(configuredBaseUrl);
      baseUrl = parsed.hostname === 'api.infobip.com' || parsed.hostname.endsWith('.api.infobip.com')
        ? parsed.origin
        : 'https://api.infobip.com';
    } catch {
      baseUrl = '';
    }
  }
  const apiKey = environment.INFOBIP_API_KEY?.trim();
  const applicationId = environment.INFOBIP_2FA_APPLICATION_ID?.trim();
  const messageId = environment.INFOBIP_2FA_MESSAGE_ID?.trim();
  const signingSecret = environment.FAIRONES_PHONE_IDENTITY_SECRET?.trim() || environment.FAIRONES_SPEAKER_GRANT_SECRET?.trim();
  if (!baseUrl || !apiKey || !applicationId || !messageId || !signingSecret) {
    throw new Error('Infobip phone verification configuration is incomplete.');
  }
  return { baseUrl, apiKey, applicationId, messageId, signingSecret };
}

export function normalizeUsPhone(value: unknown): string {
  if (typeof value !== 'string') throw new PhoneIdentityError('Enter an active US mobile number.', 400);
  const digits = value.replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (national.length !== 10 || national.startsWith('0') || national.startsWith('1')) {
    throw new PhoneIdentityError('Enter a valid 10-digit US mobile number.', 400);
  }
  return `1${national}`;
}

export function normalizeDisplayName(value: unknown): string {
  const displayName = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  if (displayName.length < 2 || displayName.length > 36) {
    throw new PhoneIdentityError('Display name must contain 2–36 characters.', 400);
  }
  if (!/^[\p{L}\p{N} ._'-]+$/u.test(displayName)) {
    throw new PhoneIdentityError('Display name contains unsupported characters.', 400);
  }
  return displayName;
}

function signToken(payload: ChallengePayload | IdentityPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function readToken<T extends ChallengePayload | IdentityPayload>(token: unknown, secret: string): T {
  if (typeof token !== 'string') throw new PhoneIdentityError('Verification session is invalid.', 401);
  const [body, signature] = token.split('.');
  if (!body || !signature) throw new PhoneIdentityError('Verification session is invalid.', 401);
  const expected = createHmac('sha256', secret).update(body).digest();
  const provided = Buffer.from(signature, 'base64url');
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new PhoneIdentityError('Verification session is invalid.', 401);
  }
  let payload: T;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    throw new PhoneIdentityError('Verification session is invalid.', 401);
  }
  if (!payload.exp || payload.exp < Date.now()) throw new PhoneIdentityError('Verification session expired.', 401);
  return payload;
}

export async function sendVerificationCode(phone: string, displayName: string, config: InfobipConfig) {
  const response = await fetch(`${config.baseUrl}/2fa/2/pin`, {
    method: 'POST',
    headers: {
      Authorization: `App ${config.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      applicationId: config.applicationId,
      messageId: config.messageId,
      to: phone,
    }),
  });
  const responseText = await response.text();
  let result: {
    pinId?: string;
    message?: string;
    description?: string;
    requestError?: { serviceException?: { text?: string; messageId?: string } };
  } = {};
  try {
    result = JSON.parse(responseText) as typeof result;
  } catch {
    // Preserve a safe fallback when the provider returns a non-JSON response.
  }
  if (!response.ok || !result.pinId) {
    const providerMessage = result.requestError?.serviceException?.text
      || result.requestError?.serviceException?.messageId
      || result.message
      || result.description;
    throw new PhoneIdentityError(
      providerMessage || `Infobip rejected the verification request (HTTP ${response.status}).`,
      502,
    );
  }
  const challenge = signToken({
    kind: 'phone-challenge',
    phone,
    displayName,
    pinId: result.pinId,
    exp: Date.now() + 10 * 60 * 1000,
  }, config.signingSecret);
  return { challenge, maskedPhone: `(***) ***-${phone.slice(-4)}` };
}

export async function verifyCode(challenge: unknown, pin: unknown, displayName: string, config: InfobipConfig) {
  const payload = readToken<ChallengePayload>(challenge, config.signingSecret);
  if (payload.kind !== 'phone-challenge' || payload.displayName !== displayName) {
    throw new PhoneIdentityError('Display name changed. Request a new code.', 400);
  }
  const normalizedPin = typeof pin === 'string' ? pin.trim() : '';
  if (!/^\d{4,8}$/.test(normalizedPin)) throw new PhoneIdentityError('Enter the verification code from your text.', 400);
  const response = await fetch(`${config.baseUrl}/2fa/2/pin/${encodeURIComponent(payload.pinId)}/verify`, {
    method: 'POST',
    headers: {
      Authorization: `App ${config.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pin: normalizedPin }),
  });
  const result = await response.json() as { verified?: boolean; attemptsRemaining?: number };
  if (!response.ok || result.verified !== true) {
    throw new PhoneIdentityError(
      typeof result.attemptsRemaining === 'number'
        ? `Code not accepted. ${result.attemptsRemaining} attempt${result.attemptsRemaining === 1 ? '' : 's'} remaining.`
        : 'The verification code was not accepted.',
      401,
    );
  }
  const phoneHash = createHmac('sha256', config.signingSecret).update(payload.phone).digest('hex');
  const identityToken = signToken({
    kind: 'chat-identity',
    phoneHash,
    displayName,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  }, config.signingSecret);
  return { identityToken, displayName, expiresInDays: 30 };
}

export function verifyIdentity(identityToken: unknown, config: InfobipConfig) {
  const payload = readToken<IdentityPayload>(identityToken, config.signingSecret);
  if (payload.kind !== 'chat-identity' || !payload.phoneHash || !payload.displayName) {
    throw new PhoneIdentityError('Verified chat identity is invalid.', 401);
  }
  return { verified: true, displayName: payload.displayName };
}

export function createSigningSecret(): string {
  return randomBytes(48).toString('base64url');
}
