import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AudioSession,
  isTrackReference,
  LiveKitRoom,
  TrackReferenceOrPlaceholder,
  useTracks,
  VideoTrack,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { colors, fonts } from '../theme';
import { LiveKitJoinCredentials, requestLiveKitJoinCredentials } from '../services/livekit';

const MAIN_EVENT_ROOM = 'fairones-main-event';

type Props = { visible: boolean; onClose: () => void };

export function LiveRoomModal({ visible, onClose }: Props) {
  const [credentials, setCredentials] = useState<LiveKitJoinCredentials | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setCredentials(null);
      setError(null);
      return;
    }

    let active = true;
    requestLiveKitJoinCredentials(MAIN_EVENT_ROOM, 'Fair Ones Viewer')
      .then((result) => { if (active) setCredentials(result); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to connect.'); });
    return () => { active = false; };
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.screen}>
        {credentials ? (
          <LiveKitRoom
            serverUrl={credentials.serverUrl}
            token={credentials.participantToken}
            connect={visible}
            audio={false}
            video={false}
            options={{ adaptiveStream: true, dynacast: true }}
            onError={(reason) => setError(reason.message)}
          >
            <LiveRoomContent onClose={onClose} />
          </LiveKitRoom>
        ) : (
          <ConnectionGate error={error} onClose={onClose} />
        )}
      </View>
    </Modal>
  );
}

function ConnectionGate({ error, onClose }: { error: string | null; onClose: () => void }) {
  return (
    <View style={styles.gate}>
      <Image source={require('../../assets/featured-battle.png')} resizeMode="cover" style={styles.asset} />
      <View style={styles.scrim} />
      <CloseButton onPress={onClose} />
      <View style={styles.gateCard}>
        {error ? <Ionicons name="cloud-offline-outline" size={38} color={colors.danger} /> : <ActivityIndicator color={colors.goldBright} size="large" />}
        <Text style={styles.gateTitle}>{error ? 'STREAM UNAVAILABLE' : 'ENTERING LIVE ROOM'}</Text>
        <Text style={styles.gateCopy}>{error || 'Securing your viewer pass…'}</Text>
      </View>
    </View>
  );
}

function LiveRoomContent({ onClose }: { onClose: () => void }) {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ], { onlySubscribed: true });
  const videoTrack = tracks.find(isTrackReference) as TrackReferenceOrPlaceholder | undefined;

  useEffect(() => {
    AudioSession.startAudioSession();
    return () => { AudioSession.stopAudioSession(); };
  }, []);

  return (
    <View style={styles.room}>
      {videoTrack && isTrackReference(videoTrack) ? (
        <VideoTrack trackRef={videoTrack} style={styles.asset} />
      ) : (
        <Image source={require('../../assets/featured-battle.png')} resizeMode="cover" style={styles.asset} />
      )}
      <View style={styles.scrim} />
      <View style={styles.top}>
        <CloseButton onPress={onClose} />
        <View style={styles.live}><View style={styles.dot} /><Text style={styles.liveText}>LIVE · SECURE ROOM</Text></View>
      </View>
      <View style={styles.center}>
        <Text style={styles.round}>ROUND 1</Text>
        <Text style={styles.title}>FUFFIE <Text style={{ color: colors.gold }}>vs</Text> BADMANBREAD</Text>
        {!videoTrack && <Text style={styles.waiting}>The broadcast room is connected. Waiting for the host camera…</Text>}
      </View>
      <View style={styles.chat}>
        <Text style={styles.chatText}><Text style={styles.handle}>@fairones</Text> Where things get settled.</Text>
      </View>
    </View>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="Close live room" onPress={onPress} style={styles.close}><Ionicons name="close" size={26} color={colors.white} /></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  room: { flex: 1, padding: 18, justifyContent: 'space-between' },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  asset: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,7,8,0.42)' },
  gateCard: { width: '82%', alignItems: 'center', padding: 24, borderRadius: 16, backgroundColor: 'rgba(7,7,8,0.88)', borderWidth: 1, borderColor: colors.line },
  gateTitle: { color: colors.white, fontFamily: fonts.condensed, fontSize: 22, marginTop: 13 },
  gateCopy: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  top: { paddingTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { position: 'relative', zIndex: 3, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.72)' },
  live: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.72)' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  liveText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.8 },
  center: { alignItems: 'center', paddingHorizontal: 10 },
  round: { color: colors.goldBright, fontFamily: fonts.condensedMedium, fontSize: 14, letterSpacing: 3 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 36, textAlign: 'center', marginTop: 5 },
  waiting: { color: colors.white, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 300, backgroundColor: 'rgba(0,0,0,0.70)', padding: 12, borderRadius: 9, marginTop: 10 },
  chat: { gap: 9, paddingBottom: 22 },
  chatText: { color: colors.white, fontFamily: fonts.body, fontSize: 12, backgroundColor: 'rgba(0,0,0,0.66)', alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 14 },
  handle: { color: colors.goldBright, fontFamily: fonts.bodySemibold },
});
