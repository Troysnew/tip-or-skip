import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import { Text } from '../components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Btn } from '../components/ui';
import { buyPro, PRO_PRICE, restorePro, TEST_MODE } from '../pro/purchases';
import { useStore } from '../store';
import { useColors } from '../theme';

const FEATURES: { title: string; line: string; soon?: boolean }[] = [
  { title: 'Tip history', line: 'Every tip you save, with monthly totals and CSV export for expense reports.' },
  { title: 'Saved presets', line: 'One tap for "my usual 20%" or "split with the team."' },
  { title: 'Split by item', line: 'Each person pays for what they ordered, with tax and tip divided fairly.' },
  { title: 'Holiday tipping planner', line: 'Who to thank, what is typical, and a budget you can check off.' },
  { title: 'Receipt scan', line: 'Point the camera at the check to fill in the bill and tax.', soon: true },
];

export function Paywall() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const { paywall, closePaywall, setPro, flash } = useStore();
  const [busy, setBusy] = useState(false);
  if (paywall === null) return null;

  const run = async (fn: () => Promise<boolean>, done: string) => {
    setBusy(true);
    try {
      if (await fn()) {
        setPro(true);
        closePaywall();
        flash(done);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={closePaywall} statusBarTranslucent>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} onPress={closePaywall} accessibilityLabel="Close" />
      <View style={st.wrap} pointerEvents="box-none">
        <View style={[st.sheet, { backgroundColor: c.bg, paddingBottom: insets.bottom + 16 }]}>
          <ScrollView contentContainerStyle={{ gap: 14, padding: 20 }}>
            <Image
              source={scheme === 'dark' ? require('../../assets/brand/paywall-header-dark.png') : require('../../assets/brand/paywall-header-light.png')}
              style={st.header}
              resizeMode="contain"
              accessibilityLabel="Tip or Skip Pro"
            />
            <View style={{ gap: 4 }}>
              <Text style={[st.eyebrow, { color: c.accent }]}>{paywall ? `${paywall} is a Pro feature` : 'Upgrade'}</Text>
              <Text style={[st.title, { color: c.ink }]}>Unlock Pro</Text>
              <Body muted>One payment of {PRO_PRICE}. No subscription.</Body>
            </View>
            <View style={{ gap: 12 }}>
              {FEATURES.map((f) => (
                <View key={f.title} style={st.feature}>
                  <Text style={{ color: c.accent, fontSize: 16, fontWeight: '800', width: 18 }}>✓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>
                      {f.title}
                      {f.soon ? <Text style={{ color: c.muted, fontWeight: '600', fontSize: 12 }}>  Coming soon</Text> : null}
                    </Text>
                    <Body muted small>{f.line}</Body>
                  </View>
                </View>
              ))}
            </View>
            <Btn title={busy ? 'Working…' : TEST_MODE ? `Unlock Pro (test mode)` : `Unlock Pro for ${PRO_PRICE}`} onPress={() => !busy && run(buyPro, 'Pro unlocked')} />
            {TEST_MODE && (
              <View style={[st.note, { backgroundColor: c.infoBg }]}>
                <Text style={{ color: c.info, fontSize: 13 }}>Purchases aren't connected yet. This unlocks Pro on this phone only, so you can test the features. You can turn it back off from the About tab.</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Btn ghost small title="Restore purchase" onPress={() => !busy && run(restorePro, 'Purchase restored')} /></View>
              <View style={{ flex: 1 }}><Btn ghost small title="Not now" onPress={closePaywall} /></View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  eyebrow: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  header: { width: '100%', aspectRatio: 1024 / 320, borderRadius: 16 },
  title: { fontFamily: 'display', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  feature: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  note: { borderRadius: 10, padding: 12 },
});
