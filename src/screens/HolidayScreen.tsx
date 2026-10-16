import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { font } from '../fonts';
import { Text } from '../components/Text';
import { Body, Btn, Card, Checkbox, Chip, H2, H3, ProTag } from '../components/ui';
import { HOLIDAY_SOURCE_URL, HOLIDAY_TEMPLATES } from '../data/holiday';
import { money, parseAmount } from '../lib/tip';
import { newId, type HolidayItem } from '../state';
import { useStore } from '../store';
import { mono, useColors } from '../theme';

export function HolidayScreen() {
  const c = useColors();
  const { pro, holiday, setHoliday, openPaywall } = useStore();
  const [custom, setCustom] = useState('');

  if (!pro) {
    return (
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><H2>Holiday tipping</H2><ProTag /></View>
        <Card>
          <Body>Plan your year-end thank-yous: mail carrier, sitter, cleaner, trash crew and more. See what's typical, set a budget, and check people off as you go.</Body>
          <Btn title="See Pro" onPress={() => openPaywall('Holiday tipping planner')} />
        </Card>
      </View>
    );
  }

  const items = holiday.items;
  const update = (id: string, p: Partial<HolidayItem>) => setHoliday((h) => ({ ...h, items: h.items.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  const add = (who: string, templateId?: string) => setHoliday((h) => ({ ...h, items: [...h.items, { id: newId(), who, templateId, amount: '', given: false }] }));
  const remove = (it: HolidayItem) =>
    Alert.alert('Remove from your list?', it.who, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setHoliday((h) => ({ ...h, items: h.items.filter((x) => x.id !== it.id) })) },
    ]);

  const planned = items.reduce((t, i) => t + parseAmount(i.amount), 0);
  const given = items.filter((i) => i.given).reduce((t, i) => t + parseAmount(i.amount), 0);
  const unused = HOLIDAY_TEMPLATES.filter((t) => !items.some((i) => i.templateId === t.id));
  const thisYear = new Date().getFullYear();

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <H2>Holiday tipping {holiday.year}</H2>
        <Body muted>Add the people you want to thank, set an amount, and check them off.</Body>
      </View>

      <View style={st.stats}>
        <Card style={st.stat}>
          <Text style={[st.statLabel, { color: c.muted }]}>Budget</Text>
          <Text style={[st.statNum, { color: c.ink }]}>{money(planned)}</Text>
          <Body muted small>{items.length} people</Body>
        </Card>
        <Card style={st.stat}>
          <Text style={[st.statLabel, { color: c.muted }]}>Given</Text>
          <Text style={[st.statNum, { color: c.accent }]}>{money(given)}</Text>
          <Body muted small>{items.filter((i) => i.given).length} of {items.length} done</Body>
        </Card>
      </View>

      {items.length > 0 && (
        <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
          {items.map((it, i) => {
            const t = HOLIDAY_TEMPLATES.find((x) => x.id === it.templateId);
            return (
              <Pressable key={it.id} onLongPress={() => remove(it)} style={[st.row, i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.line }]}>
                <Checkbox checked={it.given} onToggle={() => update(it.id, { given: !it.given })} label={`Given to ${it.who}`} />
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text style={{ color: c.ink, fontWeight: '600', textDecorationLine: it.given ? 'line-through' : 'none' }}>{it.who}</Text>
                  {t && <Text style={{ color: c.muted, fontSize: 12 }}>{t.guide}</Text>}
                </View>
                <View style={[st.amount, { borderColor: c.line, backgroundColor: c.bg }]}>
                  <Text style={{ color: c.muted, fontFamily: mono }}>$</Text>
                  <TextInput
                    value={it.amount}
                    onChangeText={(v) => update(it.id, { amount: v.replace(/[^0-9.]/g, '') })}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={c.muted}
                    style={{ flex: 1, color: c.ink, fontFamily: font('mono', 700), fontSize: 15, paddingVertical: 6, paddingHorizontal: 4 }}
                    accessibilityLabel={`Amount for ${it.who}`}
                  />
                </View>
              </Pressable>
            );
          })}
        </Card>
      )}
      {items.length > 0 && <Body muted small>Press and hold someone to remove them.</Body>}

      <Card>
        <H3>{items.length ? 'Add more people' : 'Who do you want to thank?'}</H3>
        <View style={st.chips}>
          {unused.map((t) => <Chip key={t.id} label={`+ ${t.who}`} onPress={() => add(t.who, t.id)} />)}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="Someone else, e.g. Coach Dana"
            placeholderTextColor={c.muted}
            returnKeyType="done"
            onSubmitEditing={() => { if (custom.trim()) { add(custom.trim()); setCustom(''); } }}
            style={[st.input, { borderColor: c.line, backgroundColor: c.bg, color: c.ink }]}
          />
          <Btn small title="Add" onPress={() => { if (custom.trim()) { add(custom.trim()); setCustom(''); } }} />
        </View>
        <Text accessibilityRole="link" onPress={() => Linking.openURL(HOLIDAY_SOURCE_URL)} style={{ color: c.muted, fontSize: 13 }}>
          Suggested amounts: <Text style={{ color: c.accent, fontWeight: '600', textDecorationLine: 'underline' }}>Emily Post Institute holiday tipping guide</Text>
        </Text>
      </Card>

      {holiday.year !== thisYear && (
        <Btn ghost title={`Start ${thisYear} with the same people`} onPress={() => setHoliday((h) => ({ year: thisYear, items: h.items.map((i) => ({ ...i, given: false })) }))} />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, gap: 2 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  statNum: { fontFamily: mono, fontWeight: '700', fontSize: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  amount: { width: 84, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 15, fontFamily: font('body') },
});
