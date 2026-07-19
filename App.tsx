import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { BottomNav, TabKey } from './src/components/BottomNav';
import { LiveRoomModal } from './src/components/LiveRoomModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { CompeteScreen, LiveScreen, ProfileScreen, ScheduleScreen } from './src/screens/SecondaryScreens';
import { AccountScreen, AdminScreen, FeaturedBattleScreen } from './src/screens/UtilityScreens';
import { upcomingEvents } from './src/data/events';
import { AppContent, defaultContent } from './src/content';
import { colors } from './src/theme';

type UtilityScreen = 'featured' | 'account' | 'admin' | null;
const CONTENT_STORAGE_KEY = '@fairones/admin-content-v2';

function FairOnesApp() {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [utilityScreen, setUtilityScreen] = useState<UtilityScreen>(null);
  const [liveVisible, setLiveVisible] = useState(false);
  const [content, setContent] = useState<AppContent>(defaultContent);

  useEffect(() => {
    AsyncStorage.getItem(CONTENT_STORAGE_KEY).then((stored) => {
      if (stored) setContent(JSON.parse(stored) as AppContent);
    }).catch(() => undefined);
  }, []);

  const displayEvents = useMemo(() => content.events.map((event, index) => ({
    ...event,
    image: event.imageUrl.trim() ? { uri: event.imageUrl.trim() } : upcomingEvents[index]?.image ?? require('./assets/featured-battle.png'),
  })), [content.events]);

  const openEvent = (id: string) => {
    const event = displayEvents.find((item) => item.id === id);
    if (event) Alert.alert(event.title, `${event.category}\n${event.date} · ${event.time}`, [{ text: 'Got it' }]);
  };

  const selectTab = (tab: TabKey) => {
    setUtilityScreen(null);
    setActiveTab(tab);
  };

  const saveAdminContent = (nextContent: AppContent) => {
    setContent(nextContent);
    AsyncStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(nextContent)).catch(() => undefined);
    setUtilityScreen('account');
    Alert.alert('Content saved', 'Your text and thumbnail changes are now visible on this device.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.shell}>
        {utilityScreen === 'featured' && <FeaturedBattleScreen content={content} onBack={() => setUtilityScreen(null)} />}
        {utilityScreen === 'account' && <AccountScreen content={content} onBack={() => setUtilityScreen(null)} onOpenAdmin={() => setUtilityScreen('admin')} />}
        {utilityScreen === 'admin' && <AdminScreen content={content} onBack={() => setUtilityScreen('account')} onSave={saveAdminContent} />}
        {!utilityScreen && activeTab === 'Home' && <HomeScreen content={content} events={displayEvents} onWatchLive={() => Alert.alert('Reminder set', 'We will remind you before FUFFIE vs BADMANBREAD on August 28 at 7:00 PM ET.')} onOpenEvent={openEvent} onOpenFeatured={() => setUtilityScreen('featured')} onOpenAccount={() => setUtilityScreen('account')} />}
        {!utilityScreen && activeTab === 'Live' && <LiveScreen content={content} onWatch={() => setLiveVisible(true)} />}
        {!utilityScreen && activeTab === 'Compete' && <CompeteScreen />}
        {!utilityScreen && activeTab === 'Schedule' && <ScheduleScreen events={displayEvents} onOpenEvent={openEvent} />}
        {!utilityScreen && activeTab === 'Profile' && <ProfileScreen />}
        <BottomNav active={activeTab} onChange={selectTab} />
      </View>
      <LiveRoomModal visible={liveVisible} onClose={() => setLiveVisible(false)} />
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular, Oswald_600SemiBold, Oswald_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return <View style={styles.loading}><ActivityIndicator color={colors.goldBright} /></View>;
  return <SafeAreaProvider><StatusBar style="light" backgroundColor={colors.ink} /><FairOnesApp /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1, backgroundColor: colors.ink, alignItems: Platform.OS === 'web' ? 'center' : 'stretch' },
  shell: {
    flex: Platform.OS === 'web' ? undefined : 1,
    width: Platform.OS === 'web' ? 390 : '100%',
    height: Platform.OS === 'web' ? 844 : undefined,
    maxWidth: Platform.OS === 'web' ? 390 : undefined,
    backgroundColor: colors.ink,
    overflow: 'hidden',
  },
});
