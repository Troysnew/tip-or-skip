import React, { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { isAvailable, readText } from '../../modules/receipt-reader';
import { Icon, type IconName } from '../components/icons';
import { Text } from '../components/Text';
import { Body, Btn, Card, Chip, H2, Label, MoneyField } from '../components/ui';
import { font } from '../fonts';
import { parseReceipt, toSplit, type ScanItem, type ScanPerson } from '../lib/receipt';
import { money } from '../lib/tip';
import { newId } from '../state';
import { mono, space, useColors } from '../theme';

export type SplitFromReceipt = ReturnType<typeof toSplit>;

interface Props {
  visible: boolean;
  /** People already in the calculator's split by item, used as the starting guests. */
  people: ScanPerson[];
  onClose: () => void;
  onUse: (split: SplitFromReceipt) => void;
}

type Phase = 'choose' | 'reading' | 'review';

/** Longest side of the photo handed to the reader. Enough for small receipt print. */
const MAX_SIDE = 2400;

const num = (s: string) => {
  const v = parseFloat((s || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(v) ? v : 0;
};
const fmt = (v: number | null) => (v === null ? '' : v.toFixed(2));

export { isAvailable as canScanReceipts };

export function ReceiptScreen({ visible, people: startPeople, onClose, onUse }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('choose');
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ScanItem[]>([]);
  const [people, setPeople] = useState<ScanPerson[]>([]);
  const [subtotal, setSubtotal] = useState('');
  const [tax, setTax] = useState('');
  const [service, setService] = useState('');
  const [total, setTotal] = useState('');
  const [taxIncluded, setTaxIncluded] = useState(false);

  const reset = () => {
    setPhase('choose');
    setError(null);
  };
  const close = () => {
    reset();
    onClose();
  };

  const read = async (source: 'camera' | 'library') => {
    setError(null);
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError('Camera access is off for Tip or Skip. Turn it on in your phone settings, or choose a photo instead.');
          return;
        }
      }
      const res =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 1 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 1 });
      if (res.canceled || !res.assets?.[0]) return;
      setPhase('reading');

      // Shrink big photos and bake in the rotation, so the reader sees an upright image.
      // If that step fails on a device, read the original photo instead of giving up.
      const asset = res.assets[0];
      let uri = asset.uri;
      try {
        const ctx = ImageManipulator.manipulate(asset.uri);
        if (Math.max(asset.width, asset.height) > MAX_SIDE) {
          // Pass only the side being set. Android rejects an explicit null for the other one.
          const size = asset.height >= asset.width ? { height: MAX_SIDE } : { width: MAX_SIDE };
          ctx.resize(size as unknown as { width: number | null; height: number | null });
        }
        uri = (await (await ctx.renderAsync()).saveAsync({ format: SaveFormat.JPEG, compress: 0.9 })).uri;
      } catch {
        uri = asset.uri;
      }

      let result;
      try {
        result = await readText(uri);
      } catch (e) {
        throw new Error(`Couldn't read the text in that photo. ${e instanceof Error ? e.message : ''}`.trim());
      }
      const parsed = parseReceipt(result.lines);

      if (!parsed.items.length && parsed.total === null) {
        setPhase('choose');
        setError("Couldn't find any prices in that photo. Try again with the whole receipt flat, in good light, filling the frame.");
        return;
      }
      setItems(parsed.items.map((i) => ({ id: newId(), name: i.qty > 1 ? `${i.qty} × ${i.name}` : i.name, price: i.price.toFixed(2), who: [] })));
      const named = startPeople.filter((p) => p.name.trim());
      setPeople(named.length >= 2 ? named : [{ id: newId(), name: 'Guest 1' }, { id: newId(), name: 'Guest 2' }]);
      setSubtotal(fmt(parsed.subtotal));
      setTax(fmt(parsed.tax));
      setService(fmt(parsed.serviceCharge));
      setTotal(fmt(parsed.total));
      setTaxIncluded(parsed.taxIncluded);
      setPhase('review');
    } catch (e) {
      setPhase('choose');
      setError(e instanceof Error && e.message ? e.message : "Couldn't read that photo. Try again.");
    }
  };

  // Live check as people fix lines: do the items add up to what the receipt says?
  const check = useMemo(() => {
    const sum = items.reduce((a, i) => a + num(i.price), 0);
    const target = taxIncluded ? num(total) - num(service) : num(subtotal) || num(total) - num(tax) - num(service);
    if (!target) return { sum, target: null as number | null, ok: null as boolean | null };
    return { sum, target, ok: Math.abs(sum - target) <= 0.02 };
  }, [items, subtotal, tax, service, total, taxIncluded]);

  const setItem = (id: string, p: Partial<ScanItem>) => setItems((all) => all.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const toggle = (item: ScanItem, personId: string | null) =>
    setItem(item.id, {
      who: personId === null ? [] : item.who.includes(personId) ? item.who.filter((x) => x !== personId) : [...item.who, personId],
    });

  const unassigned = items.filter((i) => !i.who.length).length;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close} presentationStyle="fullScreen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={[st.bar, { paddingTop: insets.top + 8, borderBottomColor: c.line }]}>
          <Text style={{ color: c.ink, fontFamily: 'display', fontSize: 20, flex: 1 }}>{phase === 'review' ? 'Check the receipt' : 'Scan a receipt'}</Text>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} style={st.close}>
            <Text style={{ color: c.accent, fontWeight: '600', fontSize: 16 }}>Close</Text>
          </Pressable>
        </View>

        {phase === 'reading' && (
          <View style={st.center}>
            <ActivityIndicator size="large" color={c.accent} />
            <Text style={{ color: c.ink, fontSize: 16, fontWeight: '600' }}>Reading the receipt…</Text>
            <Text style={{ color: c.muted, fontSize: 14 }}>This happens on your phone.</Text>
          </View>
        )}

        {phase === 'choose' && (
          <ScrollView contentContainerStyle={[st.body, { paddingBottom: insets.bottom + 24 }]}>
            <View style={[st.hero, { backgroundColor: c.sunk }]}>
              <Icon name="receipt" color={c.accent} size={40} />
            </View>
            <H2>Split the check by item</H2>
            <Body muted>Take a photo of the itemized receipt. You'll check each line, then tap who had what.</Body>
            <View style={{ gap: 6 }}>
              <Tip c={c} text="Lay it flat with the whole receipt in the frame." />
              <Tip c={c} text="Good light, no shadows across the prices." />
              <Tip c={c} text="Long receipt? Fold away the top so the items fill the photo." />
            </View>
            {error && (
              <View style={[st.note, { backgroundColor: c.maybeBg }]}>
                <Text style={{ color: c.maybe, fontSize: 14, lineHeight: 20 }}>{error}</Text>
              </View>
            )}
            <BigChoice c={c} icon="camera" title="Take a photo" onPress={() => read('camera')} />
            <BigChoice c={c} icon="photo" title="Choose a photo" onPress={() => read('library')} />
            <Text style={{ color: c.muted, fontSize: 13, textAlign: 'center' }}>Receipts are read on your phone. Photos are never uploaded.</Text>
          </ScrollView>
        )}

        {phase === 'review' && (
          <>
            <ScrollView contentContainerStyle={[st.body, { paddingBottom: 24 }]} keyboardShouldPersistTaps="handled">
              <View style={[st.note, { backgroundColor: check.ok === false ? c.maybeBg : check.ok ? c.yesBg : c.infoBg }]}>
                <Text style={{ color: check.ok === false ? c.maybe : check.ok ? c.yes : c.info, fontSize: 14, lineHeight: 20 }}>
                  {check.ok === null
                    ? 'Check each line against the receipt.'
                    : check.ok
                      ? `The items add up to the receipt's ${taxIncluded ? 'total' : 'subtotal'}, ${money(check.target!)}.`
                      : `The items add up to ${money(check.sum)}, but the receipt says ${money(check.target!)}. Fix a misread price or add a missing line.`}
                </Text>
              </View>

              <Label>Who's splitting?</Label>
              {people.map((p, i) => (
                <View key={p.id} style={st.row}>
                  <TextInput
                    value={p.name}
                    onChangeText={(t) => setPeople((all) => all.map((x) => (x.id === p.id ? { ...x, name: t } : x)))}
                    placeholder={`Guest ${i + 1}`}
                    placeholderTextColor={c.muted}
                    style={[st.input, { flex: 1, borderColor: c.border, backgroundColor: c.surface, color: c.ink }]}
                    accessibilityLabel={`Name for guest ${i + 1}`}
                  />
                  <RemoveBtn
                    c={c}
                    label={`Remove ${p.name || `guest ${i + 1}`}`}
                    disabled={people.length <= 1}
                    onPress={() => {
                      setPeople((all) => all.filter((x) => x.id !== p.id));
                      setItems((all) => all.map((it) => ({ ...it, who: it.who.filter((w) => w !== p.id) })));
                    }}
                  />
                </View>
              ))}
              <Btn small ghost title="+ Add guest" onPress={() => setPeople((all) => [...all, { id: newId(), name: `Guest ${all.length + 1}` }])} />

              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
                <Label>Items</Label>
                <Text style={{ color: c.muted, fontSize: 13 }}>Tap who had each one</Text>
              </View>
              {items.map((it) => (
                <Card key={it.id} outlined style={{ gap: 10, padding: 12 }}>
                  <View style={st.row}>
                    <TextInput
                      value={it.name}
                      onChangeText={(t) => setItem(it.id, { name: t })}
                      placeholder="Item"
                      placeholderTextColor={c.muted}
                      style={[st.input, { flex: 1, borderColor: c.border, backgroundColor: c.surface, color: c.ink }]}
                      accessibilityLabel="Item name"
                    />
                    <View style={[st.price, { borderColor: c.border, backgroundColor: c.surface }]}>
                      <Text style={{ color: c.muted, fontFamily: mono }}>$</Text>
                      <TextInput
                        value={it.price}
                        onChangeText={(t) => setItem(it.id, { price: t.replace(/[^0-9.-]/g, '') })}
                        keyboardType="numbers-and-punctuation"
                        placeholder="0.00"
                        placeholderTextColor={c.muted}
                        style={{ flex: 1, color: c.ink, fontFamily: font('mono'), fontSize: 16, paddingVertical: 10, paddingHorizontal: 4, fontVariant: ['tabular-nums'] }}
                        accessibilityLabel={`Price for ${it.name || 'item'}`}
                      />
                    </View>
                    <RemoveBtn c={c} label={`Remove ${it.name || 'item'}`} onPress={() => setItems((all) => all.filter((x) => x.id !== it.id))} />
                  </View>
                  <View style={st.chips}>
                    <Chip label="Everyone" active={!it.who.length} onPress={() => toggle(it, null)} />
                    {people.map((p, i) => (
                      <Chip key={p.id} label={p.name.trim() || `Guest ${i + 1}`} active={it.who.includes(p.id)} onPress={() => toggle(it, p.id)} />
                    ))}
                  </View>
                </Card>
              ))}
              <Btn small ghost title="+ Add item" onPress={() => setItems((all) => [...all, { id: newId(), name: '', price: '', who: [] }])} />

              <Label>From the receipt</Label>
              <Card style={{ gap: 12 }}>
                <View style={st.two}>
                  <MoneyField label="Subtotal" value={subtotal} onChange={setSubtotal} />
                  <MoneyField label="Tax" value={tax} onChange={setTax} />
                </View>
                <View style={st.two}>
                  <MoneyField label="Service charge" value={service} onChange={setService} />
                  <MoneyField label="Total" value={total} onChange={setTotal} />
                </View>
                {taxIncluded && <Text style={{ color: c.muted, fontSize: 14 }}>Prices on this receipt already include tax, so tax won't be added twice.</Text>}
                {num(service) > 0 && (
                  <Text style={{ color: c.muted, fontSize: 14 }}>
                    This bill already includes a {money(num(service))} service charge. It's split with each person's share, and the tip starts at No tip.
                  </Text>
                )}
              </Card>
              {unassigned > 0 && people.length > 1 && (
                <Text style={{ color: c.muted, fontSize: 14 }}>
                  {unassigned === items.length ? 'Every item' : `${unassigned} ${unassigned === 1 ? 'item is' : 'items are'}`} set to Everyone and will be split evenly.
                </Text>
              )}
            </ScrollView>
            <View style={[st.footer, { paddingBottom: insets.bottom + 12, borderTopColor: c.line, backgroundColor: c.bg }]}>
              <View style={{ flex: 1 }}><Btn ghost title="Retake" onPress={reset} /></View>
              <View style={{ flex: 2 }}>
                <Btn
                  title="Use this receipt"
                  onPress={() => {
                    onUse(toSplit(items, people, { total, tax, serviceCharge: service, taxIncluded }));
                    reset();
                  }}
                />
              </View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

type C = ReturnType<typeof useColors>;

function Tip({ c, text }: { c: C; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <View style={{ marginTop: 2 }}><Icon name="check" color={c.accent} size={16} /></View>
      <Text style={{ color: c.ink, fontSize: 14, lineHeight: 20, flex: 1 }}>{text}</Text>
    </View>
  );
}

function BigChoice({ c, icon, title, onPress }: { c: C; icon: IconName; title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [st.choice, { borderColor: c.border, backgroundColor: c.surface }, pressed && { opacity: 0.75 }]}
    >
      <Icon name={icon} color={c.accent} size={24} />
      <Text style={{ color: c.ink, fontWeight: '600', fontSize: 16 }}>{title}</Text>
    </Pressable>
  );
}

function RemoveBtn({ c, label, onPress, disabled }: { c: C; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={[st.remove, { opacity: disabled ? 0.35 : 1 }]}>
      <View style={[st.removeDot, { backgroundColor: c.sunk }]}>
        <Icon name="minus" color={c.ink} size={18} />
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.screen, paddingBottom: 12, borderBottomWidth: 1 },
  close: { minHeight: space.target, justifyContent: 'center', paddingLeft: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: space.screen },
  body: { padding: space.screen, gap: 14 },
  hero: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  note: { borderRadius: space.controlRadius, padding: 12 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: space.controlRadius, minHeight: 56, paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  two: { flexDirection: 'row', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { borderWidth: 1.5, borderRadius: space.controlRadius, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, fontFamily: font('body'), minHeight: space.target },
  price: { width: 108, minHeight: space.target, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: space.controlRadius, paddingHorizontal: 10 },
  remove: { width: 40, height: space.target, alignItems: 'center', justifyContent: 'center' },
  removeDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: space.screen, paddingTop: 12, borderTopWidth: 1 },
});
