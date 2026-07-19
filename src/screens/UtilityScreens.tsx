import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContent, defaultContent } from '../content';
import { colors, fonts } from '../theme';

function UtilityHeader({ title, eyebrow, onBack }: { title: string; eyebrow: string; onBack: () => void }) {
  return (
    <View style={styles.utilityHeader}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color={colors.white} />
      </Pressable>
      <View style={styles.headerCopy}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text></View>
    </View>
  );
}

export function FeaturedBattleScreen({ content, onBack }: { content: AppContent; onBack: () => void }) {
  const releaseImage = content.featured.releaseImageUrl.trim() ? { uri: content.featured.releaseImageUrl.trim() } : require('../../assets/released-battle.png');
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.pagePad} showsVerticalScrollIndicator={false}>
      <UtilityHeader eyebrow={content.featured.eyebrow} title={content.featured.title} onBack={onBack} />
      <Text style={styles.intro}>{content.featured.intro}</Text>
      <View style={styles.releaseCard}>
        <Image source={releaseImage} style={styles.releaseImage} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(7,7,8,0.98)']} style={styles.artistShade} />
        <View style={styles.artistCopy}>
          <View style={styles.featuredBadge}><View style={[styles.badgeDot, { backgroundColor: colors.goldBright }]} /><Text style={styles.badgeText}>RELEASED BATTLE</Text></View>
          <Text style={styles.releaseTitle}>{content.featured.releaseTitle}</Text>
          <Text style={styles.artistBio}>{content.featured.releaseCaption}</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => Linking.openURL('https://www.youtube.com/@FaironesLive')} style={({ pressed }) => [styles.watchRelease, pressed && styles.pressed]}>
        <Ionicons name="play" size={20} color={colors.ink} />
        <Text style={styles.watchReleaseText}>WATCH RELEASE</Text>
      </Pressable>
    </ScrollView>
  );
}

export function AccountScreen({ content, onBack, onOpenAdmin }: { content: AppContent; onBack: () => void; onOpenAdmin: () => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.pagePad} showsVerticalScrollIndicator={false}>
      <UtilityHeader eyebrow="SETTINGS & INFORMATION" title="MY ACCOUNT" onBack={onBack} />
      <View style={styles.accountCard}>
        <Image source={require('../../assets/icon.png')} style={styles.accountLogo} />
        <Text style={styles.accountName}>{content.account.displayName}</Text>
        <Text style={styles.accountEmail}>{content.account.email}</Text>
        <Text style={styles.accountBio}>{content.account.bio}</Text>
      </View>
      <View style={styles.settingList}>
        <SettingRow icon="account-edit-outline" label="Personal information" value={content.account.location} />
        <SettingRow icon="bell-outline" label="Notifications" value="Live alerts on" />
        <SettingRow icon="shield-account-outline" label="Privacy & safety" value="Review settings" />
        <SettingRow icon="help-circle-outline" label="Help & support" value="Fair Ones support" />
      </View>
      <Pressable accessibilityRole="button" onPress={onOpenAdmin} style={({ pressed }) => [styles.adminButton, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="shield-crown-outline" size={23} color={colors.ink} />
        <Text style={styles.adminButtonText}>ENTER ADMIN MODE</Text>
      </Pressable>
      <Text style={styles.adminNote}>Prototype admin changes are saved on this device. Production access will require a secured administrator login.</Text>
    </ScrollView>
  );
}

function SettingRow({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) {
  return <View style={styles.settingRow}><MaterialCommunityIcons name={icon} size={22} color={colors.goldBright} /><View style={styles.settingCopy}><Text style={styles.settingLabel}>{label}</Text><Text style={styles.settingValue}>{value}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></View>;
}

type FieldProps = { label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean; placeholder?: string };
function EditorField({ label, value, onChangeText, multiline, placeholder }: FieldProps) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} multiline={multiline} placeholder={placeholder} placeholderTextColor="#686A70" style={[styles.input, multiline && styles.inputMultiline]} /></View>;
}

export function AdminScreen({ content, onBack, onSave }: { content: AppContent; onBack: () => void; onSave: (content: AppContent) => void }) {
  const [draft, setDraft] = useState<AppContent>(() => JSON.parse(JSON.stringify(content)) as AppContent);
  const setHero = (key: keyof AppContent['hero'], value: string) => setDraft((current) => ({ ...current, hero: { ...current.hero, [key]: value } }));
  const setFeatured = (key: keyof AppContent['featured'], value: string) => setDraft((current) => ({ ...current, featured: { ...current.featured, [key]: value } }));
  const setAccount = (key: keyof AppContent['account'], value: string) => setDraft((current) => ({ ...current, account: { ...current.account, [key]: value } }));
  const setEvent = (index: number, key: keyof AppContent['events'][number], value: string) => setDraft((current) => ({ ...current, events: current.events.map((event, eventIndex) => eventIndex === index ? { ...event, [key]: value } : event) }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.pagePad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <UtilityHeader eyebrow="CONTENT CONTROL" title="ADMIN MODE" onBack={onBack} />
      <Text style={styles.adminIntro}>Edit the text and thumbnail URLs used across the Fair Ones home, artist, event, and account screens.</Text>
      <EditorSection title="HOME & LIVE MATCH">
        <EditorField label="Left artist" value={draft.hero.leftName} onChangeText={(value) => setHero('leftName', value)} />
        <EditorField label="Right artist" value={draft.hero.rightName} onChangeText={(value) => setHero('rightName', value)} />
        <EditorField label="Match category" value={draft.hero.category} onChangeText={(value) => setHero('category', value)} />
        <EditorField label="Live indicator text" value={draft.hero.liveLabel} onChangeText={(value) => setHero('liveLabel', value)} />
        <EditorField label="Watch button text" value={draft.hero.watchLabel} onChangeText={(value) => setHero('watchLabel', value)} />
        <EditorField label="Vote heading" value={draft.hero.voteLabel} onChangeText={(value) => setHero('voteLabel', value)} />
        <EditorField label="Upcoming heading" value={draft.hero.upcomingLabel} onChangeText={(value) => setHero('upcomingLabel', value)} />
        <EditorField label="Hero thumbnail URL" value={draft.hero.imageUrl} onChangeText={(value) => setHero('imageUrl', value)} placeholder="https://… (blank uses default)" />
      </EditorSection>
      <EditorSection title="FEATURED RELEASE">
        <EditorField label="Page eyebrow" value={draft.featured.eyebrow} onChangeText={(value) => setFeatured('eyebrow', value)} />
        <EditorField label="Page title" value={draft.featured.title} onChangeText={(value) => setFeatured('title', value)} />
        <EditorField label="Introduction" value={draft.featured.intro} onChangeText={(value) => setFeatured('intro', value)} multiline />
        <EditorField label="Release title" value={draft.featured.releaseTitle} onChangeText={(value) => setFeatured('releaseTitle', value)} />
        <EditorField label="Release caption" value={draft.featured.releaseCaption} onChangeText={(value) => setFeatured('releaseCaption', value)} multiline />
        <EditorField label="Released battle image URL" value={draft.featured.releaseImageUrl} onChangeText={(value) => setFeatured('releaseImageUrl', value)} placeholder="Blank uses the uploaded released-battle photo" />
      </EditorSection>
      {draft.events.map((event, index) => <EditorSection key={event.id} title={`EVENT ${index + 1}`}><EditorField label="Category" value={event.category} onChangeText={(value) => setEvent(index, 'category', value)} /><EditorField label="Title" value={event.title} onChangeText={(value) => setEvent(index, 'title', value)} /><EditorField label="Date" value={event.date} onChangeText={(value) => setEvent(index, 'date', value)} /><EditorField label="Time" value={event.time} onChangeText={(value) => setEvent(index, 'time', value)} /><EditorField label="Thumbnail URL" value={event.imageUrl} onChangeText={(value) => setEvent(index, 'imageUrl', value)} placeholder="https://… (blank uses default)" /></EditorSection>)}
      <EditorSection title="ACCOUNT INFORMATION">
        <EditorField label="Display name" value={draft.account.displayName} onChangeText={(value) => setAccount('displayName', value)} />
        <EditorField label="Email" value={draft.account.email} onChangeText={(value) => setAccount('email', value)} />
        <EditorField label="Location" value={draft.account.location} onChangeText={(value) => setAccount('location', value)} />
        <EditorField label="Bio" value={draft.account.bio} onChangeText={(value) => setAccount('bio', value)} multiline />
      </EditorSection>
      <Pressable accessibilityRole="button" onPress={() => onSave(draft)} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><Text style={styles.saveButtonText}>SAVE & PUBLISH LOCALLY</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => setDraft(JSON.parse(JSON.stringify(defaultContent)) as AppContent)} style={styles.resetButton}><Text style={styles.resetText}>RESET DEFAULT CONTENT</Text></Pressable>
    </ScrollView>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.editorSection}><Text style={styles.editorTitle}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  pagePad: { paddingHorizontal: 18, paddingBottom: 30 },
  utilityHeader: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  headerCopy: { flex: 1 },
  eyebrow: { color: colors.gold, fontFamily: fonts.condensedMedium, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 36, lineHeight: 40 },
  intro: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, marginBottom: 15 },
  releaseCard: { height: 360, borderRadius: 16, overflow: 'hidden', marginBottom: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  releaseImage: { width: '100%', height: '100%' },
  artistShade: { ...StyleSheet.absoluteFillObject },
  artistCopy: { position: 'absolute', left: 18, right: 18, bottom: 17 },
  releaseTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: 0.8, marginTop: 7 },
  artistBio: { color: colors.white, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 2 },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { color: colors.goldBright, fontFamily: fonts.condensedMedium, fontSize: 10, letterSpacing: 1.5 },
  watchRelease: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 11, backgroundColor: colors.goldBright },
  watchReleaseText: { color: colors.ink, fontFamily: fonts.condensed, fontSize: 19, letterSpacing: 1 },
  accountCard: { alignItems: 'center', padding: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 16 },
  accountLogo: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: colors.goldBright },
  accountName: { color: colors.white, fontFamily: fonts.condensed, fontSize: 25, marginTop: 10 },
  accountEmail: { color: colors.gold, fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 2 },
  accountBio: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 9 },
  settingList: { marginTop: 15, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  settingRow: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.surface },
  settingCopy: { flex: 1 },
  settingLabel: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },
  settingValue: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  adminButton: { minHeight: 53, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16, borderRadius: 11, backgroundColor: colors.goldBright },
  adminButtonText: { color: colors.ink, fontFamily: fonts.condensed, fontSize: 18, letterSpacing: 1 },
  adminNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 9.5, lineHeight: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 12 },
  adminIntro: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginBottom: 13 },
  editorSection: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 13 },
  editorTitle: { color: colors.goldBright, fontFamily: fonts.condensed, fontSize: 15, letterSpacing: 1.2, marginBottom: 8 },
  field: { marginBottom: 10 },
  fieldLabel: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 10, marginBottom: 5 },
  input: { minHeight: 43, borderWidth: 1, borderColor: '#34363C', borderRadius: 8, color: colors.white, backgroundColor: '#090A0C', paddingHorizontal: 11, paddingVertical: 9, fontFamily: fonts.body, fontSize: 12 },
  inputMultiline: { minHeight: 78, textAlignVertical: 'top' },
  saveButton: { height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.goldBright },
  saveButtonText: { color: colors.ink, fontFamily: fonts.condensed, fontSize: 18, letterSpacing: 1 },
  resetButton: { height: 46, alignItems: 'center', justifyContent: 'center' },
  resetText: { color: colors.danger, fontFamily: fonts.bodyBold, fontSize: 11 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
