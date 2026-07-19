import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FairOnesEvent } from '../data/events';
import { colors, fonts } from '../theme';

export function EventRow({ event, onPress }: { event: FairOnesEvent; onPress: () => void }) {
  const parts = event.title.split(' vs ');
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Image source={event.image} style={styles.image} />
      <View style={styles.copy}>
        <Text style={[styles.category, { color: event.accent }]}>{event.category}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {parts[0]} <Text style={{ color: event.accent }}>vs</Text> {parts[1]}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={13} color={colors.muted} />
          <Text style={styles.metaText}>{event.date}</Text>
          <Ionicons name="time-outline" size={13} color={colors.muted} />
          <Text style={styles.metaText}>{event.time}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 9 },
  image: { width: 102, height: 66, borderRadius: 7, backgroundColor: colors.surface, resizeMode: 'cover' },
  copy: { flex: 1, minWidth: 0 },
  category: { fontFamily: fonts.condensedMedium, fontSize: 10, letterSpacing: 1.2, marginBottom: 2 },
  title: { color: colors.white, fontFamily: fonts.condensed, fontSize: 17, letterSpacing: 0.2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  metaText: { color: colors.muted, fontFamily: fonts.bodyMedium, fontSize: 9.5, marginRight: 5 },
  pressed: { opacity: 0.72 },
});
