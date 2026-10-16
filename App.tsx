import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Service } from './src/data/services';
import { usePersistentState } from './src/lib/storage';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { DataScreen } from './src/screens/DataScreen';
import { ServicesScreen } from './src/screens/ServicesScreen';
import { ServiceSheet } from './src/screens/ServiceSheet';
import { initialCalc, withService, type CalcState, type Polls } from './src/state';
import { useColors } from './src/theme';

type Tab = 'calc' | 'services' | 'data';
const TABS: { id: Tab; label: string; glyph: string }[] = [
  { id: 'calc', label: 'Calculator', glyph: '%' },
  { id: 'services', label: 'Services', glyph: '?' },
  { id: 'data', label: 'Data', glyph: '▮' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

function Main() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('calc');
  const [calc, setCalc] = useState<CalcState>(initialCalc);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [polls, setPolls] = usePersistentState<Polls>('tos.polls', {});
  const [requests, setRequests] = usePersistentState<string[]>('tos.requests', []);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

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
            Tip <Text style={{ color: c.brass }}>or</Text> Skip
          </Text>
        </View>

        {tab === 'calc' && <CalculatorScreen state={calc} setState={setCalc} onOpenService={setSheetId} />}
        {tab === 'services' && (
          <ServicesScreen
            onOpenService={setSheetId}
            onRequest={(name) => {
              if (name && !requests.includes(name)) setRequests([...requests, name]);
              flash("Requested. We'll add it to the catalog.");
            }}
          />
        )}
        {tab === 'data' && <DataScreen requests={requests} />}
      </ScrollView>

      {toast && (
        <View style={[st.toast, { backgroundColor: c.ink }]} pointerEvents="none">
          <Text style={{ color: c.bg, fontWeight: '600' }}>{toast}</Text>
        </View>
      )}

      <View style={[st.tabs, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom }]} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <Pressable key={t.id} onPress={() => setTab(t.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={st.tab}>
              <Text style={{ color: on ? c.accent : c.muted, fontSize: 18, fontWeight: '800' }}>{t.glyph}</Text>
              <Text style={{ color: on ? c.accent : c.muted, fontSize: 12, fontWeight: '600' }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ServiceSheet
        serviceId={sheetId}
        onClose={() => setSheetId(null)}
        calc={calc}
        setBill={(bill, tax) => setCalc((cur) => ({ ...cur, bill, tax }))}
        polls={polls}
        onVote={(id, answer) => setPolls({ ...polls, [id]: answer })}
        onSendToCalculator={sendToCalculator}
      />
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  tag: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  brand: { fontSize: 32, fontWeight: '800', letterSpacing: -0.6 },
  tabs: { flexDirection: 'row', borderTopWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 10, gap: 2 },
  toast: { position: 'absolute', alignSelf: 'center', bottom: 96, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99 },
});
