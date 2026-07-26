import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Room, RoomEvent } from 'livekit-client';
import { colors, fonts } from '../theme';
import { requestLiveKitJoinCredentials } from '../services/livekit';

const LOBBY_ROOM = 'fairones-live-lobby';
const VERIFY_ENDPOINT = process.env.EXPO_PUBLIC_YOUTUBE_VERIFY_ENDPOINT;
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const FAIRONES_YOUTUBE_URL = 'https://www.youtube.com/@FaironesLive';

type GoogleTokenResponse = { access_token?: string; error?: string };
type GoogleTokenClient = { requestAccessToken: (options?: { prompt?: string }) => void };
type GoogleAccounts = { oauth2: { initTokenClient: (options: { client_id: string; scope: string; callback: (response: GoogleTokenResponse) => void }) => GoogleTokenClient } };

declare global { interface Window { google?: { accounts: GoogleAccounts } } }

function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-fairones-google-identity]');
    if (existing) { existing.addEventListener('load', () => resolve(), { once: true }); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.faironesGoogleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google sign-in could not be loaded.'));
    document.head.appendChild(script);
  });
}

async function verifyYouTubeSubscription(accessToken: string): Promise<string> {
  if (!VERIFY_ENDPOINT) throw new Error('YouTube subscriber verification is not configured yet.');
  const response = await fetch(VERIFY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken }) });
  const result = await response.json() as { subscriber?: boolean; speakerGrant?: string; error?: string };
  if (!response.ok) throw new Error(result.error || 'Unable to verify your YouTube subscription.');
  if (!result.subscriber || !result.speakerGrant) throw new Error('Subscribe to FairOnesLive on YouTube, then verify again to unlock your microphone.');
  return result.speakerGrant;
}

export function LiveAudioLobby() {
  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [speakerGrant, setSpeakerGrant] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async (grant?: string) => {
    const current = roomRef.current;
    if (current) await current.disconnect();
    const credentials = await requestLiveKitJoinCredentials(LOBBY_ROOM, grant ? 'Fair Ones Subscriber' : 'Fair Ones Listener', grant ? 'speaker' : 'viewer', grant);
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;
    const updateCount = () => setParticipantCount(room.remoteParticipants.size + 1);
    room.on(RoomEvent.ParticipantConnected, updateCount);
    room.on(RoomEvent.ParticipantDisconnected, updateCount);
    await room.connect(credentials.serverUrl, credentials.participantToken);
    updateCount();
    setConnected(true);
  };

  useEffect(() => {
    connect().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Audio lobby is unavailable.'));
    return () => { roomRef.current?.disconnect(); };
  }, []);

  const verify = async () => {
    setBusy(true); setError(null);
    try {
      if (!GOOGLE_CLIENT_ID) throw new Error('Google subscriber verification is not configured yet.');
      await loadGoogleIdentity();
      const accessToken = await new Promise<string>((resolve, reject) => {
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/youtube.readonly',
          callback: (response) => response.access_token ? resolve(response.access_token) : reject(new Error(response.error || 'Google authorization was cancelled.')),
        });
        client.requestAccessToken({ prompt: 'consent' });
      });
      const grant = await verifyYouTubeSubscription(accessToken);
      setSpeakerGrant(grant);
      await connect(grant);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Verification failed.'); }
    finally { setBusy(false); }
  };

  const toggleMic = async () => {
    if (!speakerGrant) { await verify(); return; }
    try {
      const next = !micEnabled;
      await roomRef.current?.localParticipant.setMicrophoneEnabled(next);
      setMicEnabled(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Microphone permission was not granted.'); }
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View><Text style={styles.kicker}>LIVE AUDIO LOBBY</Text><Text style={styles.rule}>Subscribers can speak • Everyone can listen</Text></View>
        <View style={styles.count}><View style={styles.dot} /><Text style={styles.countText}>{connected ? participantCount : '—'} HERE</Text></View>
      </View>
      <View style={styles.controls}>
        <Pressable onPress={toggleMic} disabled={busy} style={[styles.mic, micEnabled && styles.micOn]}>
          {busy ? <ActivityIndicator color={colors.ink} /> : <MaterialCommunityIcons name={micEnabled ? 'microphone' : speakerGrant ? 'microphone-outline' : 'microphone-lock'} size={24} color={speakerGrant ? colors.ink : colors.white} />}
        </Pressable>
        <View style={styles.status}><Text style={styles.statusTitle}>{speakerGrant ? (micEnabled ? 'YOU’RE SPEAKING' : 'MIC UNLOCKED') : 'LISTENING MODE'}</Text><Text style={styles.statusCopy}>{speakerGrant ? 'Tap the microphone whenever you want to mute or unmute.' : 'Verify your FairOnesLive YouTube subscription to unlock speaking.'}</Text></View>
      </View>
      {!speakerGrant && <View style={styles.actions}><Pressable onPress={() => Linking.openURL(FAIRONES_YOUTUBE_URL)} style={styles.secondary}><Text style={styles.secondaryText}>SUBSCRIBE ON YOUTUBE</Text></Pressable><Pressable onPress={verify} disabled={busy} style={styles.verify}><Text style={styles.verifyText}>VERIFY SUBSCRIPTION</Text></Pressable></View>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.surface, padding: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  kicker: { color: colors.white, fontFamily: fonts.condensed, fontSize: 19, letterSpacing: 0.8 },
  rule: { color: colors.gold, fontFamily: fonts.bodySemibold, fontSize: 10, marginTop: 2 },
  count: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, height: 24, borderRadius: 12, backgroundColor: colors.ink },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger },
  countText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 9 },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  mic: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.ink },
  micOn: { backgroundColor: colors.goldBright, borderColor: colors.goldBright },
  status: { flex: 1, marginLeft: 12 },
  statusTitle: { color: colors.white, fontFamily: fonts.condensedMedium, fontSize: 13, letterSpacing: 0.7 },
  statusCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 14, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 13 },
  secondary: { flex: 1, minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  secondaryText: { color: colors.white, fontFamily: fonts.condensedMedium, fontSize: 10, letterSpacing: 0.5 },
  verify: { flex: 1, minHeight: 36, borderRadius: 8, backgroundColor: colors.goldBright, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  verifyText: { color: colors.ink, fontFamily: fonts.condensed, fontSize: 11, letterSpacing: 0.5 },
  error: { color: colors.danger, fontFamily: fonts.bodySemibold, fontSize: 10, lineHeight: 14, marginTop: 10 },
});
