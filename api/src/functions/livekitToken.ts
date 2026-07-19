import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { issueJoinCredentials, loadTokenServiceConfig, TokenRequestError } from '../lib/tokenService';

function corsHeaders(request: HttpRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowedOrigin = process.env.FAIRONES_ALLOWED_ORIGIN || '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'Content-Type, X-FairOnes-Admin-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
  if (allowedOrigin && (!origin || origin === allowedOrigin)) headers['Access-Control-Allow-Origin'] = allowedOrigin;
  return headers;
}

async function livekitToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const headers = corsHeaders(request);
  if (request.method === 'OPTIONS') return { status: 204, headers };

  try {
    const body = await request.json();
    const credentials = await issueJoinCredentials(
      typeof body === 'object' && body !== null ? body : {},
      request.headers.get('x-fairones-admin-key'),
      loadTokenServiceConfig(),
    );
    return { status: 200, headers, jsonBody: credentials };
  } catch (error) {
    const status = error instanceof TokenRequestError ? error.status : error instanceof SyntaxError ? 400 : 500;
    if (status === 500) context.error('LiveKit token generation failed', error);
    return { status, headers, jsonBody: { error: status === 500 ? 'Livestream service is temporarily unavailable.' : status === 400 && error instanceof SyntaxError ? 'Request body must be valid JSON.' : (error as Error).message } };
  }
}

app.http('livekitToken', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'livekit/token',
  handler: livekitToken,
});
