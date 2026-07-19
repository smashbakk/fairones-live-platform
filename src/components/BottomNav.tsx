import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

export type TabKey = 'Home' | 'Live' | 'Compete' | 'Schedule' | 'Profile';

const tabs: { key: TabKey; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'Home', icon: 'home-variant' },
  { key: 'Live', icon: 'broadcast' },
  { key: 'Compete', icon: 'trophy-outline' },
  { key: 'Schedule', icon: 'calendar-month-outline' },
  { key: 'Profile', icon: 'account-circle-outline' },
];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onChange(tab.key)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
            {selected && <View style={styles.selectedLine} />}
            <MaterialCommunityIcons name={tab.icon} size={24} color={selected ? colors.goldBright : colors.muted} />
            <Text style={[styles.label, selected && styles.labelActive]}>{tab.key.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { height: 76, flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: '#090A0C', paddingBottom: 5 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative' },
  selectedLine: { position: 'absolute', top: 0, width: 35, height: 2, backgroundColor: colors.goldBright },
  label: { color: colors.muted, fontFamily: fonts.condensedMedium, fontSize: 9, letterSpacing: 0.65 },
  labelActive: { color: colors.goldBright },
  pressed: { opacity: 0.65 },
});
