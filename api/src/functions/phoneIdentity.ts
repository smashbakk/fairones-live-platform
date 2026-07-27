import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import {
  loadInfobipConfig,
  normalizeDisplayName,
  normalizeUsPhone,
  PhoneIdentityError,
  sendVerificationCode,
  verifyCode,
  verifyIdentity,
} from '../lib/phoneIdentity';

const headers = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};

function failure(error: unknown, context: InvocationContext): HttpResponseInit {
  const status = error instanceof PhoneIdentityError ? error.status : error instanceof SyntaxError ? 400 : 500;
  if (status === 500) context.error('Phone identity verification failed', error);
  return {
    status,
    headers,
    jsonBody: {
      error: status === 500
        ? 'Phone verification is temporarily unavailable.'
        : error instanceof SyntaxError
          ? 'Request body must be valid JSON.'
          : (error as Error).message,
    },
  };
}

async function phoneStart(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as { phone?: unknown; displayName?: unknown };
    const phone = normalizeUsPhone(body?.phone);
    const displayName = normalizeDisplayName(body?.displayName);
    const result = await sendVerificationCode(phone, displayName, loadInfobipConfig());
    return { status: 200, headers, jsonBody: result };
  } catch (error) {
    return failure(error, context);
  }
}

async function phoneVerify(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as { challenge?: unknown; pin?: unknown; displayName?: unknown };
    const displayName = normalizeDisplayName(body?.displayName);
    const result = await verifyCode(body?.challenge, body?.pin, displayName, loadInfobipConfig());
    return { status: 200, headers, jsonBody: result };
  } catch (error) {
    return failure(error, context);
  }
}

async function phoneSession(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as { identityToken?: unknown };
    const result = verifyIdentity(body?.identityToken, loadInfobipConfig());
    return { status: 200, headers, jsonBody: result };
  } catch (error) {
    return failure(error, context);
  }
}

app.http('phoneStart', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'phone/start',
  handler: phoneStart,
});

app.http('phoneVerify', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'phone/verify',
  handler: phoneVerify,
});

app.http('phoneSession', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'phone/session',
  handler: phoneSession,
});
