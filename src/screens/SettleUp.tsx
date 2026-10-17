import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Icon } from '../components/icons';
import { Text } from '../components/Text';
import { Body, Btn, Label } from '../components/ui';
import { font } from '../fonts';
import { cleanHandle, hasHandles, openPayApp, PAY_APPS, requestMessage, type PayHandles, type RequestInput } from '../lib/pay';
import { money } from '../lib/tip';
import { useProGate, useStore } from '../store';
import { mono, space, useColors } from '../theme';

function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} onPress={onClose} accessibilityLabel="Close" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.wrap} pointerEvents="box-none">
        <View style={[st.sheet, { backgroundColor: c.bg, paddingBottom: insets.bottom + 16 }]}>
          <View style={st.head}>
            <Text style={{ color: c.ink, fontFamily: 'display', fontSize: 22, flex: 1 }}>{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} style={st.close}>
              <Text style={{ color: c.accent, fontWeight: '600', fontSize: 16 }}>Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ gap: 12, paddingHorizontal: space.screen, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export type PayMode = 'full' | 'tip' | 'other';

/**
 * Free: pick a pay app. The chosen amount is copied so it can be pasted in that app.
 * Full, tip only (paid the bill at the register, tipping the person separately), or any amount.
 */
export function PaySheet({ visible, full, tip, defaultMode, onClose }: { visible: boolean; full: number; tip: number; defaultMode: PayMode; onClose: () => void }) {
  const c = useColors();
  const { flash } = useStore();
  const [mode, setMode] = useState<PayMode>(defaultMode);
  const [other, setOther] = useState('');
  const tipOnlyDiffers = tip > 0 && Math.abs(full - tip) > 0.004;
  useEffect(() => {
    if (visible) {
      setMode(tipOnlyDiffers ? defaultMode : 'full');
      setOther('');
    }
  }, [visible, defaultMode, tipOnlyDiffers]);

  const amount = mode === 'tip' ? tip : mode === 'other' ? Math.max(0, parseFloat(other.replace(/[^0-9.]/g, '')) || 0) : full;
  const value = amount.toFixed(2);

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(value);
      return true;
    } catch {
      return false;
    }
  };
  const open = async (app: (typeof PAY_APPS)[number]) => {
    const copied = amount > 0 && (await copy());
    onClose();
    const how = await openPayApp(app, (u) => Linking.openURL(u));
    if (how === 'none') flash(`Couldn't open ${app.name}`);
    else if (copied) flash(`Copied ${money(amount)}. Paste it in ${app.name}.`);
  };

  const choice = (m: PayMode, label: string, sub?: string) => (
    <Pressable
      key={m}
      onPress={() => setMode(m)}
      accessibilityRole="radio"
      accessibilityState={{ selected: mode === m }}
      style={[st.choice, { borderColor: mode === m ? c.selected : c.border, backgroundColor: mode === m ? c.selected : c.surface }]}
    >
      <Text style={{ color: mode === m ? c.onSelected : c.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      {sub ? <Text style={{ color: mode === m ? c.onSelected : c.muted, fontFamily: mono, fontSize: 14 }}>{sub}</Text> : null}
    </Pressable>
  );

  return (
    <Sheet visible={visible} onClose={onClose} title="Pay">
      {tipOnlyDiffers && (
        <View style={st.choices}>
          {choice('full', 'Full', money(full))}
          {choice('tip', 'Tip only', money(tip))}
          {choice('other', 'Other')}
        </View>
      )}
      {mode === 'other' ? (
        <View style={[st.amount, { backgroundColor: c.result }]}>
          <Text style={{ color: c.onResult, fontSize: 14, fontWeight: '600' }}>Amount</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: c.onResult, fontFamily: mono, fontSize: 40, lineHeight: 46 }}>$</Text>
            <TextInput
              autoFocus
              value={other}
              onChangeText={(t) => setOther(t.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="rgba(24,35,34,0.45)"
              style={{ flex: 1, color: c.onResult, fontFamily: font('mono'), fontSize: 40, paddingVertical: 0, fontVariant: ['tabular-nums'] }}
              accessibilityLabel="Amount to pay"
            />
          </View>
        </View>
      ) : (
        <View style={[st.amount, { backgroundColor: c.result }]}>
          <Text style={{ color: c.onResult, fontSize: 14, fontWeight: '600' }}>{mode === 'tip' ? 'Tip only' : 'Amount'}</Text>
          <Text style={{ color: c.onResult, fontFamily: mono, fontSize: 40, lineHeight: 46 }}>{money(amount)}</Text>
        </View>
      )}
      <Body muted small>Pick an app. The amount is copied, so you can paste it in.</Body>
      {PAY_APPS.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => open(a)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${a.name}`}
          style={({ pressed }) => [st.row, { borderColor: c.border, backgroundColor: c.surface }, pressed && { opacity: 0.75 }]}
        >
          <Text style={{ color: c.ink, fontWeight: '600', fontSize: 16, flex: 1 }}>{a.name}</Text>
          <Text style={{ color: c.muted, fontSize: 14 }}>Open</Text>
        </Pressable>
      ))}
      <Pressable
        onPress={async () => {
          if (await copy()) flash(`Copied ${money(amount)}`);
          onClose();
        }}
        accessibilityRole="button"
        style={({ pressed }) => [st.row, { borderColor: c.border, backgroundColor: c.surface }, pressed && { opacity: 0.75 }]}
      >
        <Text style={{ color: c.ink, fontWeight: '600', fontSize: 16, flex: 1 }}>Just copy the amount</Text>
        <Icon name="check" color={c.accent} size={18} />
      </Pressable>
      <Text style={{ color: c.muted, fontSize: 13 }}>Paying with Zelle or Apple Cash? Copy the amount and open your bank app or Messages.</Text>
    </Sheet>
  );
}

/** Where friends pay you: Venmo, Cash App and PayPal usernames, kept on this phone. */
export function HandlesSheet({ visible, onClose, onSaved }: { visible: boolean; onClose: () => void; onSaved?: (h: PayHandles) => void }) {
  const c = useColors();
  const { payHandles, setPayHandles } = useStore();
  const [draft, setDraft] = useState<PayHandles>(payHandles);
  useEffect(() => {
    if (visible) setDraft(payHandles);
  }, [visible, payHandles]);

  const field = (key: keyof PayHandles, label: string, prefix: string, placeholder: string) => (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <View style={[st.input, { borderColor: c.border, backgroundColor: c.surface }]}>
        <Text style={{ color: c.muted, fontSize: 16 }}>{prefix}</Text>
        <TextInput
          value={draft[key]}
          onChangeText={(t) => setDraft((d) => ({ ...d, [key]: t }))}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={{ flex: 1, color: c.ink, fontSize: 16, fontFamily: font('body'), paddingVertical: 12, paddingHorizontal: 4 }}
          accessibilityLabel={`${label} username`}
        />
      </View>
    </View>
  );

  const save = () => {
    const clean: PayHandles = {
      venmo: cleanHandle('venmo', draft.venmo),
      cashtag: cleanHandle('cashtag', draft.cashtag),
      paypal: cleanHandle('paypal', draft.paypal),
    };
    setPayHandles(clean);
    onSaved?.(clean);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="How friends pay you">
      <Body muted small>Add any you use. They go into the request message as pay links with the amount filled in. Saved on this phone only.</Body>
      {field('venmo', 'Venmo', '@', 'username')}
      {field('cashtag', 'Cash App', '$', 'cashtag')}
      {field('paypal', 'PayPal.Me', 'paypal.me/', 'name')}
      <Btn title="Save" onPress={save} />
    </Sheet>
  );
}

/**
 * Pro: send someone a payment request through the phone's share sheet (Messages, WhatsApp...).
 * Asks for pay usernames first if none are saved.
 */
export function useRequest() {
  const { payHandles } = useStore();
  const gate = useProGate();
  const [pending, setPending] = useState<RequestInput | null>(null);

  const send = (r: RequestInput, handles: PayHandles) => {
    Share.share({ message: requestMessage(handles, r) }).catch(() => {});
  };

  const request = (r: RequestInput) =>
    gate('Payment requests', () => {
      if (hasHandles(payHandles)) send(r, payHandles);
      else setPending(r);
    });

  const sheet = (
    <HandlesSheet
      visible={pending !== null}
      onClose={() => setPending(null)}
      onSaved={(h) => {
        const r = pending;
        setPending(null);
        if (r && hasHandles(h)) setTimeout(() => send(r, h), 350);
      }}
    />
  );
  return { request, sheet };
}

const st = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: space.cardRadius, borderTopRightRadius: space.cardRadius, paddingTop: 8 },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.screen, paddingVertical: 10 },
  close: { minHeight: space.target, justifyContent: 'center', paddingLeft: 12 },
  amount: { borderRadius: space.cardRadius, padding: 16, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: space.controlRadius, minHeight: 56, paddingHorizontal: 16 },
  choices: { flexDirection: 'row', gap: 8 },
  choice: { flex: 1, borderWidth: 1.5, borderRadius: space.controlRadius, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 2 },
  input: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: space.controlRadius, paddingHorizontal: 12, minHeight: space.target },
});
