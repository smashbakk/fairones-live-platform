import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EventRow } from '../components/EventRow';
import { LiveAudioLobby } from '../components/LiveAudioLobby';
import { FairOnesEvent } from '../data/events';
import { AppContent } from '../content';
import { colors, fonts } from '../theme';

function ScreenHeader({ title, eyebrow }: { title: string; eyebrow: string }) {
  return <View style={styles.header}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text></View>;
}

export function LiveScreen({ onWatch, content }: { onWatch: () => void; content: AppContent }) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.livePad}><ScreenHeader eyebrow="ON AIR NOW" title="LIVE" /><LiveAudioLobby /><View style={styles.liveRoomCard}><MaterialCommunityIcons name="broadcast" size={34} color={colors.pink} /><View style={styles.liveRoomCopy}><Text style={styles.liveRoomTitle}>{content.hero.leftName} vs {content.hero.rightName}</Text><Text style={styles.liveRoomBody}>Watch the event, vote round by round, and follow the audience reaction.</Text></View><GoldButton label="ENTER LIVE ROOM" onPress={onWatch} compact /></View></ScrollView>;
}

export function CompeteScreen() {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.pad}><ScreenHeader eyebrow="YOUR MATCH. YOUR TERMS." title="COMPETE" /><View style={styles.heroCard}><MaterialCommunityIcons name="trophy-outline" size={52} color={colors.goldBright} /><Text style={styles.cardTitle}>SUBMIT A MATCH</Text><Text style={styles.body}>Choose rap battle, basketball, chess, or debate. Match creation will connect to moderation and scheduling before launch.</Text><GoldButton label="START SUBMISSION" onPress={() => Alert.alert('Submission saved', 'The production form will connect when the Fair Ones backend is ready.')} /></View></ScrollView>;
}

export function ScheduleScreen({ onOpenEvent, events }: { onOpenEvent: (id: string) => void; events: FairOnesEvent[] }) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.pad}><ScreenHeader eyebrow="SAVE THE DATE" title="SCHEDULE" />{events.map((event) => <EventRow key={event.id} event={event} onPress={() => onOpenEvent(event.id)} />)}</ScrollView>;
}

export function ProfileScreen() {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.pad}><ScreenHeader eyebrow="OFFICIAL CHANNEL" title="FAIR ONES LIVE" /><View style={styles.profileMark}><MaterialCommunityIcons name="youtube" size={55} color="#FF0033" /></View><Text style={styles.cardTitle}>WATCH THE ARCHIVE</Text><Text style={[styles.body, { textAlign: 'center' }]}>Full battles, event replays, trailers, and official Fair Ones releases.</Text><GoldButton label="OPEN YOUTUBE" onPress={() => Linking.openURL('https://www.youtube.com/@FaironesLive')} /><View style={styles.infoBlock}><Text style={styles.infoTitle}>STORE-READY PROFILE BASICS</Text><Text style={styles.infoText}>Privacy policy, community guidelines, content reporting, account deletion, and support links must be live before submission.</Text></View></ScrollView>;
}

function GoldButton({ label, onPress, compact = false }: { label: string; onPress: () => void; compact?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.button, compact && styles.buttonCompact, pressed && { opacity: 0.75 }]}><LinearGradient colors={[colors.goldBright, colors.goldDeep]} style={styles.buttonInner}><Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>{label}</Text></LinearGradient></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  pad: { padding: 20, paddingBottom: 30 },
  livePad: { paddingBottom: 90 },
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18 },
  eyebrow: { color: colors.gold, fontFamily: fonts.condensedMedium, fontSize: 11, letterSpacing: 2.5 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 44, lineHeight: 49, letterSpacing: 1 },
  heroCard: { margin: 20, marginTop: 6, minHeight: 300, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 24 },
  liveRoomCard: { marginHorizontal: 20, marginTop: 14, minHeight: 176, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16 },
  liveRoomCopy: { alignItems: 'center', marginTop: 6 },
  liveRoomTitle: { color: colors.white, fontFamily: fonts.condensed, fontSize: 20, textAlign: 'center' },
  liveRoomBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 4, marginBottom: 8, textAlign: 'center' },
  cardTitle: { color: colors.white, fontFamily: fonts.condensed, fontSize: 25, marginTop: 14, textAlign: 'center' },
  body: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 20 },
  button: { width: '100%', height: 52, borderRadius: 10, overflow: 'hidden', marginTop: 8 },
  buttonCompact: { height: 42, marginTop: 4 },
  buttonInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.ink, fontFamily: fonts.condensed, fontSize: 18, letterSpacing: 1 },
  buttonTextCompact: { fontSize: 15 },
  profileMark: { alignSelf: 'center', width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginVertical: 18 },
  infoBlock: { marginTop: 28, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 18 },
  infoTitle: { color: colors.gold, fontFamily: fonts.condensedMedium, fontSize: 12, letterSpacing: 1.5 },
  infoText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, marginTop: 6 },
});
