import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FONT_FILES } from './src/fonts';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './src/components/Text';
import { Icon, type IconName } from './src/components/icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Service } from './src/data/services';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { DataScreen } from './src/screens/DataScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HolidayScreen } from './src/screens/HolidayScreen';
import { Paywall } from './src/screens/Paywall';
import { ServicesScreen } from './src/screens/ServicesScreen';
import { ServiceSheet } from './src/screens/ServiceSheet';
import { initialCalc, withService, type CalcState } from './src/state';
import { StoreProvider, useStore } from './src/store';
import { space, useColors } from './src/theme';

type Tab = 'calc' | 'services' | 'history' | 'holiday' | 'about';
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'calc', label: 'Calculator', icon: 'calculator' },
  { id: 'services', label: 'Services', icon: 'services' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'holiday', label: 'Holidays', icon: 'holidays' },
  { id: 'about', label: 'About', icon: 'about' },
];

// Keep the splash screen up until the brand fonts are ready, so nothing renders in a fallback font.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hide();
  }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Main() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { toast, flash, requests, setRequests } = useStore();
  const [tab, setTab] = useState<Tab>('calc');
  const [calc, setCalc] = useState<CalcState>(initialCalc);
  const [sheetId, setSheetId] = useState<string | null>(null);

  const sendToCalculator = (s: Service, choice: number, qty: number) => {
    setCalc((cur) => {
      const next = withService(cur, s);
      return s.flat ? { ...next, flatAmount: String(choice), qty } : { ...next, pct: choice };
    });
    setSheetId(null);
    setTab('calc');
  };

  return (
    <View style={[st.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <StatusBar style="auto" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: Math.max(space.screen, insets.left, insets.right), paddingTop: 12, paddingBottom: 32, gap: 18 }}
      >
        <View style={st.appBar} accessibilityRole="header" accessibilityLabel="Tip or Skip">
          <View style={[st.tile, { backgroundColor: c.tile }]}>
            <Image source={require('./assets/brand/symbol-mint.png')} style={st.symbol} accessibilityIgnoresInvertColors />
          </View>
          <Text style={[st.appName, { color: c.ink }]}>Tip or Skip</Text>
        </View>

        {tab === 'calc' && <CalculatorScreen state={calc} setState={setCalc} onOpenService={setSheetId} />}
        {tab === 'services' && (
          <ServicesScreen
            onOpenService={setSheetId}
            onRequest={(name) => {
              if (name && !requests.includes(name)) setRequests((r) => [...r, name]);
              flash("Requested. We'll add it to the catalog.");
            }}
          />
        )}
        {tab === 'history' && <HistoryScreen />}
        {tab === 'holiday' && <HolidayScreen />}
        {tab === 'about' && <DataScreen />}
      </ScrollView>

      {toast && (
        <View style={[st.toast, { backgroundColor: c.ink, bottom: 80 + insets.bottom }]} pointerEvents="none">
          <Text style={{ color: c.bg, fontWeight: '600' }}>{toast}</Text>
        </View>
      )}

      <View style={[st.tabs, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <Pressable key={t.id} onPress={() => setTab(t.id)} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }} style={st.tab}>
              <View style={[st.tabPill, on && { backgroundColor: c.sunk }]}>
                <Icon name={t.icon} color={on ? c.accent : c.muted} />
              </View>
              <Text numberOfLines={1} style={{ color: on ? c.accent : c.muted, fontSize: 12, fontWeight: '600' }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ServiceSheet
        serviceId={sheetId}
        onClose={() => setSheetId(null)}
        calc={calc}
        setBill={(bill, tax) => setCalc((cur) => ({ ...cur, bill, tax }))}
        onSendToCalculator={sendToCalculator}
      />
      <Paywall />
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  appBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tile: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  symbol: { width: 36, height: 36 },
  appName: { fontFamily: 'display', fontSize: 21, letterSpacing: -0.3 },
  tabs: { flexDirection: 'row', borderTopWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 8, gap: 3, minHeight: 60 },
  tabPill: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'absolute', alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99 },
});
