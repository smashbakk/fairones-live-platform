import { app, HttpResponseInit } from '@azure/functions';
import { loadTokenServiceConfig } from '../lib/tokenService';

function health(): HttpResponseInit {
  try {
    loadTokenServiceConfig();
    return {
      status: 200,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
      jsonBody: { service: 'fairones-live-api', ready: true },
    };
  } catch {
    return {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
      jsonBody: { service: 'fairones-live-api', ready: false },
    };
  }
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: health,
});
