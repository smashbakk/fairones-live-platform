import React from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';

export function LiveRoomModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}><View style={styles.screen}><View style={styles.image}><Image source={require('../../assets/featured-battle.png')} resizeMode="cover" style={styles.asset} /><LinearGradient colors={['rgba(7,7,8,0.25)', 'rgba(7,7,8,0.70)', colors.ink]} style={StyleSheet.absoluteFill} /><View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Close live room" onPress={onClose} style={styles.close}><Ionicons name="close" size={26} color={colors.white} /></Pressable><View style={styles.live}><View style={styles.dot} /><Text style={styles.liveText}>LIVE · 1,248 WATCHING</Text></View></View><View style={styles.center}><Text style={styles.round}>ROUND 1</Text><Text style={styles.title}>FUFFIE <Text style={{ color: colors.gold }}>vs</Text> BADMANBREAD</Text><Text style={styles.placeholder}>LiveKit video connects here after the secure production token server is configured.</Text></View><View style={styles.chat}><Text style={styles.chatText}><Text style={styles.handle}>@faironesfan</Text> This round is close 🔥</Text><Text style={styles.chatText}><Text style={styles.handle}>@atownlive</Text> Crowd reaction says everything.</Text></View></View></View></Modal>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  image: { flex: 1, padding: 18, justifyContent: 'space-between' },
  asset: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' },
  top: { paddingTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' },
  live: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.70)' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  liveText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.8 },
  center: { alignItems: 'center', paddingHorizontal: 10 },
  round: { color: colors.goldBright, fontFamily: fonts.condensedMedium, fontSize: 14, letterSpacing: 3 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 36, textAlign: 'center', marginTop: 5 },
  placeholder: { color: colors.white, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 300, backgroundColor: 'rgba(0,0,0,0.64)', padding: 12, borderRadius: 9, marginTop: 10 },
  chat: { gap: 9, paddingBottom: 22 },
  chatText: { color: colors.white, fontFamily: fonts.body, fontSize: 12, backgroundColor: 'rgba(0,0,0,0.60)', alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 14 },
  handle: { color: colors.goldBright, fontFamily: fonts.bodySemibold },
});
