import { createHmac } from 'node:crypto';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

function corsHeaders(request: HttpRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowedOrigin = process.env.FAIRONES_ALLOWED_ORIGIN || '';
  const headers: Record<string, string> = { 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store', 'Content-Type': 'application/json', Vary: 'Origin' };
  if (allowedOrigin && (!origin || origin === allowedOrigin)) headers['Access-Control-Allow-Origin'] = allowedOrigin;
  return headers;
}

function createSpeakerGrant(secret: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: true, exp: Date.now() + 10 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

async function youtubeSubscription(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const headers = corsHeaders(request);
  if (request.method === 'OPTIONS') return { status: 204, headers };
  try {
    const body = await request.json() as { accessToken?: unknown };
    const accessToken = typeof body?.accessToken === 'string' ? body.accessToken.trim() : '';
    const channelId = process.env.FAIRONES_YOUTUBE_CHANNEL_ID?.trim();
    const grantSecret = process.env.FAIRONES_SPEAKER_GRANT_SECRET?.trim();
    if (!accessToken) return { status: 400, headers, jsonBody: { error: 'Google authorization is required.' } };
    if (!channelId || !grantSecret) throw new Error('YouTube subscriber verification configuration is incomplete.');
    const url = new URL('https://www.googleapis.com/youtube/v3/subscriptions');
    url.searchParams.set('part', 'id');
    url.searchParams.set('mine', 'true');
    url.searchParams.set('forChannelId', channelId);
    url.searchParams.set('maxResults', '1');
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const result = await response.json() as { items?: unknown[]; error?: { message?: string } };
    if (!response.ok) return { status: 401, headers, jsonBody: { error: result.error?.message || 'YouTube authorization could not be verified.' } };
    const subscriber = Array.isArray(result.items) && result.items.length > 0;
    return { status: 200, headers, jsonBody: subscriber ? { subscriber: true, speakerGrant: createSpeakerGrant(grantSecret) } : { subscriber: false } };
  } catch (error) {
    context.error('YouTube subscription verification failed', error);
    return { status: 500, headers, jsonBody: { error: 'Subscriber verification is temporarily unavailable.' } };
  }
}

app.http('youtubeSubscription', { methods: ['POST', 'OPTIONS'], authLevel: 'anonymous', route: 'youtube/subscription', handler: youtubeSubscription });
