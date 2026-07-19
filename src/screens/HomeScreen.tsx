import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandHeader } from '../components/BrandHeader';
import { EventRow } from '../components/EventRow';
import { FairOnesEvent } from '../data/events';
import { AppContent } from '../content';
import { colors, fonts } from '../theme';

type HomeScreenProps = {
  content: AppContent;
  events: FairOnesEvent[];
  onWatchLive: () => void;
  onOpenEvent: (id: string) => void;
  onOpenFeatured: () => void;
  onOpenAccount: () => void;
};

export function HomeScreen({ content, events, onWatchLive, onOpenEvent, onOpenFeatured, onOpenAccount }: HomeScreenProps) {
  const [vote, setVote] = useState<string | null>(null);
  const leftVote = content.hero.leftName.toUpperCase();
  const rightVote = content.hero.rightName.toUpperCase();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BrandHeader onOpenFeatured={onOpenFeatured} onOpenAccount={onOpenAccount} />
      <View style={styles.hero}>
        <View style={styles.heroImage}>
          {content.hero.imageUrl.trim() ? (
            <Image source={{ uri: content.hero.imageUrl.trim() }} resizeMode="cover" style={styles.heroAsset} />
          ) : (
            <View style={styles.heroPortraits}>
              <View style={styles.portraitHalf}>
                <Image source={require('../../assets/fuffie-artist.jpg')} resizeMode="cover" style={[styles.portraitImage, styles.fuffiePortrait]} />
                <LinearGradient colors={['rgba(241,21,108,0.34)', 'transparent']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </View>
              <View style={styles.portraitDivider} />
              <View style={styles.portraitHalf}>
                <Image source={require('../../assets/badmanbread-artist.jpg')} resizeMode="cover" style={[styles.portraitImage, styles.badmanPortrait]} />
                <LinearGradient colors={['transparent', 'rgba(22,119,255,0.34)']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </View>
            </View>
          )}
          <LinearGradient colors={['rgba(7,7,8,0.03)', 'rgba(7,7,8,0.15)', colors.ink]} locations={[0, 0.63, 1]} style={StyleSheet.absoluteFill} />
          <View style={styles.liveNow}><View style={styles.liveDot} /><Text style={styles.liveNowText}>{content.hero.liveLabel}</Text></View>
          <Text style={styles.vs}>VS</Text>
          <View style={styles.names}>
            <Text style={[styles.name, { color: colors.pink }]}>{content.hero.leftName}</Text>
            <Text numberOfLines={1} style={[styles.name, styles.nameRight, { color: colors.blue }]}>{content.hero.rightName}</Text>
          </View>
          <Text style={styles.category}>{content.hero.category}</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={onWatchLive} style={({ pressed }) => [styles.watchButton, pressed && styles.buttonPressed]}>
        <LinearGradient colors={[colors.goldBright, colors.gold, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.watchGradient}>
          <Ionicons name="notifications" size={23} color={colors.ink} />
          <Text style={styles.watchText}>{content.hero.watchLabel}</Text>
        </LinearGradient>
      </Pressable>
      <View style={styles.voteSection}>
        <Text style={styles.sectionLabel}>{content.hero.voteLabel}</Text>
        <View style={styles.voteControl}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Vote for ${leftVote}`} accessibilityState={{ selected: vote === leftVote }} onPress={() => setVote(leftVote)} style={[styles.voteSide, styles.votePink, vote === leftVote && styles.voteSelected]}>
            <Ionicons name={vote === leftVote ? 'checkmark-circle' : 'person-circle-outline'} size={22} color={colors.pink} />
            <Text style={[styles.voteText, { color: colors.pink }]}>{leftVote}</Text>
          </Pressable>
          <View style={styles.or}><Text style={styles.orText}>{vote ? '✓' : 'OR'}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Vote for ${rightVote}`} accessibilityState={{ selected: vote === rightVote }} onPress={() => setVote(rightVote)} style={[styles.voteSide, styles.voteBlue, vote === rightVote && styles.voteSelected]}>
            <Ionicons name={vote === rightVote ? 'checkmark-circle' : 'person-circle-outline'} size={22} color={colors.blue} />
            <Text style={[styles.voteText, { color: colors.blue }]}>{rightVote}</Text>
          </Pressable>
        </View>
        {vote && <Text accessibilityLiveRegion="polite" style={styles.voteThanks}>Vote locked for {vote}. You can change it until the matchup closes.</Text>}
      </View>
      <View style={styles.upcoming}>
        <Text style={styles.sectionLabelLeft}>{content.hero.upcomingLabel}</Text>
        {events.map((event) => <EventRow key={event.id} event={event} onPress={() => onOpenEvent(event.id)} />)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { paddingBottom: 18 },
  hero: { marginHorizontal: 12, height: 310, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.surface },
  heroImage: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 19 },
  heroAsset: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' },
  heroPortraits: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  portraitHalf: { flex: 1, overflow: 'hidden' },
  portraitImage: { width: '100%', height: '100%' },
  fuffiePortrait: { transform: [{ scale: 1.03 }] },
  badmanPortrait: { transform: [{ scale: 1.03 }] },
  portraitDivider: { width: 2, backgroundColor: colors.goldBright, opacity: 0.75 },
  liveNow: { position: 'absolute', top: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(8,8,10,0.80)', borderWidth: 1, borderColor: colors.goldBright, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.goldBright },
  liveNowText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.5 },
  vs: { color: colors.goldBright, fontFamily: fonts.display, fontSize: 58, lineHeight: 62, textShadowColor: '#000', textShadowRadius: 12, textShadowOffset: { width: 0, height: 2 } },
  names: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 17 },
  name: { maxWidth: '52%', fontFamily: fonts.display, fontSize: 39, lineHeight: 42, letterSpacing: 0.7, textShadowColor: '#000', textShadowRadius: 10 },
  nameRight: { fontSize: 29, lineHeight: 34, maxWidth: '56%', letterSpacing: 0.2 },
  category: { color: colors.goldBright, fontFamily: fonts.condensedMedium, fontSize: 13, letterSpacing: 4, marginTop: 1 },
  watchButton: { height: 61, marginHorizontal: 18, marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  watchGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  watchText: { color: colors.ink, fontFamily: fonts.condensed, fontSize: 25, letterSpacing: 1.1 },
  buttonPressed: { transform: [{ scale: 0.985 }], opacity: 0.88 },
  voteSection: { marginTop: 14, paddingHorizontal: 18, alignItems: 'center' },
  sectionLabel: { color: colors.gold, fontFamily: fonts.condensedMedium, fontSize: 13, letterSpacing: 2.2, marginBottom: 8 },
  voteControl: { height: 57, width: '100%', flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.surface },
  voteSide: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  votePink: { backgroundColor: 'rgba(241,21,108,0.08)', borderRightWidth: 0.5, borderRightColor: colors.pink },
  voteBlue: { backgroundColor: 'rgba(22,119,255,0.08)', borderLeftWidth: 0.5, borderLeftColor: colors.blue },
  voteSelected: { backgroundColor: 'rgba(255,255,255,0.09)' },
  voteText: { fontFamily: fonts.condensed, fontSize: 15 },
  or: { position: 'absolute', zIndex: 2, left: '50%', top: 10, marginLeft: -18, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.ink },
  orText: { color: colors.goldBright, fontFamily: fonts.condensed, fontSize: 12 },
  voteThanks: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, marginTop: 6, textAlign: 'center' },
  upcoming: { marginTop: 15, paddingHorizontal: 18 },
  sectionLabelLeft: { color: colors.gold, fontFamily: fonts.condensed, fontSize: 15, letterSpacing: 1.5, marginBottom: 2 },
});
