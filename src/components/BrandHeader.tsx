import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export function BrandHeader({ onOpenFeatured, onOpenAccount }: { onOpenFeatured: () => void; onOpenAccount: () => void }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 850, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const pulseStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.74, 1] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.04] }) }],
  };

  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Open featured battle" onPress={onOpenFeatured} hitSlop={8}>
        <Animated.Image source={require('../../assets/fairones-logo.png')} style={[styles.brandLogo, pulseStyle]} resizeMode="contain" />
      </Pressable>
      <View style={styles.actions}>
        <Animated.View style={[styles.liveChip, pulseStyle]}>
          <Animated.View style={[styles.liveDot, pulseStyle]} />
          <Text style={styles.liveText}>LIVE</Text>
        </Animated.View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open account settings" onPress={onOpenAccount} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]} hitSlop={8}>
          <Image source={require('../../assets/icon.png')} style={styles.avatarImage} accessibilityLabel="Your Fair Ones account" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 2, paddingBottom: 6 },
  brandLogo: { width: 130, height: 56 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  liveChip: { height: 32, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 9, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 10, backgroundColor: '#0B0C0E' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  liveText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.4 },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: colors.goldBright, overflow: 'hidden', backgroundColor: colors.surface },
  avatarImage: { width: '100%', height: '100%' },
  pressed: { opacity: 0.65, transform: [{ scale: 0.94 }] },
});
