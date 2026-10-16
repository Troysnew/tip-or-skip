import React from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Body, Btn, Card, H2, H3, ProTag } from '../components/ui';
import { money } from '../lib/tip';
import type { HistoryEntry } from '../state';
import { useStore } from '../store';
import { mono, useColors } from '../theme';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT = MONTHS.map((m) => m.slice(0, 3));

const monthKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};
const dayLabel = (t: number) => {
  const d = new Date(t);
  const h = d.getHours();
  return `${SHORT[d.getMonth()]} ${d.getDate()} · ${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
const isoDate = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function toCsv(rows: HistoryEntry[]) {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [isoDate(r.at), q(r.label), r.bill.toFixed(2), r.tip.toFixed(2), r.total.toFixed(2), r.pct ?? '', r.split].join(','));
  return ['Date,For,Bill,Tip,Total,Tip %,Split', ...lines].join('\n');
}

export function HistoryScreen() {
  const c = useColors();
  const { pro, history, setHistory, openPaywall } = useStore();

  if (!pro) {
    return (
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><H2>Tip history</H2><ProTag /></View>
        <Card>
          <Body>Save any tip from the calculator and see what you spent each month. Export it as a spreadsheet for expense reports.</Body>
          <Btn title="See Pro" onPress={() => openPaywall('Tip history')} />
        </Card>
      </View>
    );
  }

  const now = monthKey(Date.now());
  const groups = new Map<string, HistoryEntry[]>();
  history.forEach((h) => {
    const k = monthKey(h.at);
    groups.set(k, [...(groups.get(k) ?? []), h]);
  });
  const thisMonth = groups.get(now) ?? [];
  const sum = (a: HistoryEntry[]) => a.reduce((t, h) => t + h.tip, 0);

  const remove = (h: HistoryEntry) =>
    Alert.alert('Delete this tip?', `${h.label}, ${money(h.tip)}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setHistory((all) => all.filter((x) => x.id !== h.id)) },
    ]);

  return (
    <View style={{ gap: 12 }}>
      <H2>Tip history</H2>
      <View style={st.stats}>
        <Card style={st.stat}>
          <Text style={[st.statLabel, { color: c.muted }]}>Tips this month</Text>
          <Text style={[st.statNum, { color: c.accent }]}>{money(sum(thisMonth))}</Text>
          <Body muted small>{thisMonth.length} saved</Body>
        </Card>
        <Card style={st.stat}>
          <Text style={[st.statLabel, { color: c.muted }]}>All time</Text>
          <Text style={[st.statNum, { color: c.ink }]}>{money(sum(history))}</Text>
          <Body muted small>{history.length} saved</Body>
        </Card>
      </View>

      {history.length === 0 ? (
        <Card style={{ borderStyle: 'dashed' }}>
          <Body muted>Nothing saved yet. On the calculator, tap Save to history after you work out a tip.</Body>
        </Card>
      ) : (
        <>
          {[...groups.entries()].map(([k, rows]) => (
            <View key={k} style={{ gap: 6 }}>
              <View style={st.monthHead}>
                <H3>{monthLabel(k)}</H3>
                <Text style={{ color: c.muted, fontFamily: mono, fontWeight: '700' }}>{money(sum(rows))}</Text>
              </View>
              <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
                {rows.map((h, i) => (
                  <Pressable key={h.id} onLongPress={() => remove(h)} style={[st.row, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.line }]}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ color: c.ink, fontWeight: '600' }}>{h.label}</Text>
                      <Text style={{ color: c.muted, fontSize: 12 }}>
                        {dayLabel(h.at)}
                        {h.bill > 0 ? ` · bill ${money(h.bill)}` : ''}
                        {h.pct != null ? ` · ${h.pct}%` : ''}
                        {h.split > 1 ? ` · split ${h.split}` : ''}
                      </Text>
                    </View>
                    <Text style={{ color: c.ink, fontFamily: mono, fontWeight: '700', fontSize: 16 }}>{money(h.tip)}</Text>
                  </Pressable>
                ))}
              </Card>
            </View>
          ))}
          <Body muted small>Press and hold a tip to delete it.</Body>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><Btn ghost small title="Share as CSV" onPress={() => Share.share({ title: 'Tip history', message: toCsv(history) })} /></View>
            <View style={{ flex: 1 }}>
              <Btn ghost small title="Clear all" onPress={() =>
                Alert.alert('Clear all history?', 'This deletes every saved tip on this phone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: () => setHistory([]) },
                ])
              } />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, gap: 2 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  statNum: { fontFamily: mono, fontWeight: '700', fontSize: 24 },
  monthHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
});
