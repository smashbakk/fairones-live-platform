export type LiveKitJoinCredentials = {
  serverUrl: string;
  participantToken: string;
  roomName: string;
  identity: string;
  expiresAt: string;
};

type JoinRole = 'viewer' | 'speaker' | 'host';

const tokenEndpoint = process.env.EXPO_PUBLIC_LIVEKIT_TOKEN_ENDPOINT;

export async function requestLiveKitJoinCredentials(
  roomName: string,
  displayName: string,
  role: JoinRole = 'viewer',
  speakerGrant?: string,
): Promise<LiveKitJoinCredentials> {
  if (!tokenEndpoint) {
    throw new Error('Live streaming is not configured. Set EXPO_PUBLIC_LIVEKIT_TOKEN_ENDPOINT.');
  }

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomName, displayName, role, speakerGrant }),
  });

  const result = await response.json() as LiveKitJoinCredentials & { error?: string };
  if (!response.ok) {
    throw new Error(result.error || 'Unable to join the Fair Ones livestream.');
  }

  return result;
}
