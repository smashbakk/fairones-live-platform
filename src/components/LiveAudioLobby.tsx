import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

export function LiveAudioLobby() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}><MaterialCommunityIcons name="account-voice" size={22} color={colors.goldBright} /></View>
        <View style={styles.copy}>
          <Text style={styles.title}>LIVE AUDIO LOBBY</Text>
          <Text style={styles.body}>Subscribers can speak • Everyone can listen</Text>
        </View>
      </View>
      <Text style={styles.note}>Audio lobby controls are enabled first on the Fair Ones web version.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.surface, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 12 },
  title: { color: colors.white, fontFamily: fonts.condensed, fontSize: 18, letterSpacing: 0.8 },
  body: { color: colors.gold, fontFamily: fonts.bodySemibold, fontSize: 11, marginTop: 2 },
  note: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 10 },
});
