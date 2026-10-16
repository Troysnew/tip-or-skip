import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { useColors } from './src/theme';

type Tab = 'calc' | 'services' | 'history' | 'holiday' | 'about';
const TABS: { id: Tab; label: string; glyph: string }[] = [
  { id: 'calc', label: 'Calculator', glyph: '%' },
  { id: 'services', label: 'Services', glyph: '?' },
  { id: 'history', label: 'History', glyph: '≡' },
  { id: 'holiday', label: 'Holidays', glyph: '★' },
  { id: 'about', label: 'About', glyph: 'i' },
];

export default function App() {
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
        contentContainerStyle={{ paddingHorizontal: Math.max(16, insets.left, insets.right), paddingTop: 16, paddingBottom: 32, gap: 16 }}
      >
        <View>
          <Text style={[st.tag, { color: c.muted }]}>Should I tip for this?</Text>
          <Text style={[st.brand, { color: c.ink }]}>
            Tip <Text style={{ color: c.brassText }}>or</Text> Skip
          </Text>
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

      <View style={[st.tabs, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom }]} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <Pressable key={t.id} onPress={() => setTab(t.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={st.tab}>
              <Text style={{ color: on ? c.accent : c.muted, fontSize: 18, fontWeight: '800' }}>{t.glyph}</Text>
              <Text style={{ color: on ? c.accent : c.muted, fontSize: 11, fontWeight: '600' }}>{t.label}</Text>
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
  tag: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  brand: { fontSize: 32, fontWeight: '800', letterSpacing: -0.6 },
  tabs: { flexDirection: 'row', borderTopWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 10, gap: 2 },
  toast: { position: 'absolute', alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99 },
});
