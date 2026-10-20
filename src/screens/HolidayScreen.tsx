import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { font } from '../fonts';
import { Text } from '../components/Text';
import { Body, Btn, Card, Checkbox, Chip, EmptyState, H2, H3, ProTag } from '../components/ui';
import { HOLIDAY_SOURCE_URL, HOLIDAY_TEMPLATES, holidaySuggestions, type HolidayTemplate } from '../data/holiday';
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
  // Adding someone from the guide prefills a recommended amount when the guide gives one.
  const add = (who: string, t?: HolidayTemplate) => {
    const pre = t ? holidaySuggestions(t.rec).prefill : null;
    setHoliday((h) => ({ ...h, items: [...h.items, { id: newId(), who, templateId: t?.id, amount: pre ? String(pre) : '', given: false, count: 1 }] }));
  };
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

      {items.length === 0 && (
        <Card>
          <EmptyState icon="holidays" title="A little planning goes a long way." detail="Add someone from the suggestions below, or type a name." />
        </Card>
      )}
      {items.length > 0 && (
        <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
          {items.map((it, i) => (
            <HolidayRow key={it.id} it={it} last={i === items.length - 1} update={update} remove={remove} />
          ))}
        </Card>
      )}
      {items.length > 0 && <Body muted small>Press and hold someone to remove them.</Body>}

      <Card>
        <H3>{items.length ? 'Add more people' : 'Who do you want to thank?'}</H3>
        <View style={{ gap: 0 }}>
          {unused.map((t, i) => (
            <Pressable
              key={t.id}
              onPress={() => add(t.who, t)}
              accessibilityRole="button"
              accessibilityLabel={`Add ${t.who}. ${t.guide}`}
              style={({ pressed }) => [st.suggest, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }, pressed && { opacity: 0.7 }]}
            >
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text style={{ color: c.ink, fontWeight: '600', fontSize: 15 }}>{t.who}</Text>
                <Text style={{ color: c.muted, fontSize: 13, lineHeight: 18 }}>{t.guide}</Text>
              </View>
              <Text style={{ color: c.accent, fontWeight: '600', fontSize: 15 }}>+ Add</Text>
            </Pressable>
          ))}
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

/** One person on the list: guidance, one-tap suggested amounts, and inputs that drive them. */
function HolidayRow({ it, last, update, remove }: { it: HolidayItem; last: boolean; update: (id: string, p: Partial<HolidayItem>) => void; remove: (it: HolidayItem) => void }) {
  const c = useColors();
  const t = HOLIDAY_TEMPLATES.find((x) => x.id === it.templateId);
  const rec = t?.rec;
  const each = rec?.kind === 'range' && rec.each;
  const count = Math.max(1, it.count ?? 1);
  const sug = rec ? holidaySuggestions(rec, parseAmount(it.base ?? '')) : { amounts: [], prefill: null };
  const giftOnly = rec?.kind === 'gift';
  const current = parseAmount(it.amount);

  return (
    <Pressable onLongPress={() => remove(it)} style={[st.row, !last && { borderBottomWidth: 1, borderBottomColor: c.line }]}>
      <View style={st.rowTop}>
        <Checkbox checked={it.given} onToggle={() => update(it.id, { given: !it.given })} label={`Given to ${it.who}`} />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ color: c.ink, fontWeight: '600', fontSize: 16, textDecorationLine: it.given ? 'line-through' : 'none' }}>{it.who}</Text>
            {giftOnly && (
              <View style={[st.tag, { backgroundColor: c.infoBg }]}>
                <Text style={{ color: c.info, fontSize: 12, fontWeight: '600' }}>Gift only</Text>
              </View>
            )}
          </View>
          {t && <Text style={{ color: c.muted, fontSize: 13, lineHeight: 18 }}>{t.guide}</Text>}
        </View>
        <View style={[st.amount, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={{ color: c.muted, fontFamily: mono }}>$</Text>
          <TextInput
            value={it.amount}
            onChangeText={(v) => update(it.id, { amount: v.replace(/[^0-9.]/g, '') })}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={c.muted}
            style={{ flex: 1, color: c.ink, fontFamily: font('mono', 700), fontSize: 15, alignSelf: 'stretch', paddingVertical: 0, paddingHorizontal: 4 }}
            accessibilityLabel={`${giftOnly ? 'Gift budget' : 'Amount'} for ${it.who}`}
          />
        </View>
      </View>

      {rec?.kind === 'pay' && (
        <View style={st.inline}>
          <Text style={{ color: c.ink, fontSize: 14, flex: 1 }}>{rec.ask}</Text>
          <View style={[st.amount, { borderColor: c.border, backgroundColor: c.surface }]}>
            <Text style={{ color: c.muted, fontFamily: mono }}>$</Text>
            <TextInput
              value={it.base ?? ''}
              onChangeText={(v) => {
                const base = v.replace(/[^0-9.]/g, '');
                const pre = holidaySuggestions(rec, parseAmount(base)).prefill;
                // Fill the amount from the guide until the person types their own.
                const touched = it.amount !== '' && parseAmount(it.amount) !== holidaySuggestions(rec, parseAmount(it.base ?? '')).prefill;
                update(it.id, touched || pre === null ? { base } : { base, amount: String(pre) });
              }}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={c.muted}
              style={{ flex: 1, color: c.ink, fontFamily: font('mono'), fontSize: 15, alignSelf: 'stretch', paddingVertical: 0, paddingHorizontal: 4 }}
              accessibilityLabel={rec.ask}
            />
          </View>
        </View>
      )}

      {each && (
        <View style={st.inline}>
          <Text style={{ color: c.ink, fontSize: 14, flex: 1 }}>How many people?</Text>
          <View style={st.counter}>
            {[-1, 1].map((d) => (
              <Pressable
                key={d}
                onPress={() => {
                  const n = Math.max(1, Math.min(20, count + d));
                  const per = current / count;
                  update(it.id, { count: n, amount: current > 0 ? String(Math.round(per * n)) : it.amount });
                }}
                accessibilityRole="button"
                accessibilityLabel={d < 0 ? 'One fewer' : 'One more'}
                hitSlop={6}
                style={[st.countBtn, { backgroundColor: c.sunk }]}
              >
                <Text style={{ color: c.ink, fontSize: 18, fontWeight: '600' }}>{d < 0 ? '−' : '+'}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: c.ink, fontFamily: mono, fontSize: 15, width: 28, textAlign: 'center' }}>{count}</Text>
        </View>
      )}

      {sug.amounts.length > 0 && (
        <View style={st.sugRow}>
          <Text style={{ color: c.muted, fontSize: 13 }}>Suggested{each ? ' each' : ''}:</Text>
          {sug.amounts.map((a) => {
            const total = each ? a.value * count : a.value;
            const on = Math.abs(current - total) < 0.005;
            return (
              <Chip key={a.label} label={each && count > 1 ? `${a.label} × ${count}` : a.label} active={on} onPress={() => update(it.id, { amount: String(total) })} />
            );
          })}
        </View>
      )}
      {rec?.kind === 'pay' && rec.orGift && <Text style={{ color: c.muted, fontSize: 13 }}>Or give a gift instead.</Text>}
    </Pressable>
  );
}

const st = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, gap: 2 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  statNum: { fontFamily: mono, fontWeight: '700', fontSize: 24 },
  row: { gap: 10, paddingVertical: 14, paddingHorizontal: 14 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 44 },
  sugRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingLeft: 44 },
  tag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  counter: { flexDirection: 'row', gap: 8 },
  countBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  suggest: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, minHeight: 56 },
  amount: { width: 92, minHeight: 38, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 0, minHeight: 42, fontSize: 15, fontFamily: font('body') },
});
