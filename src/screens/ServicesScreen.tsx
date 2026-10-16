import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { font } from '../fonts';
import { Text } from '../components/Text';
import { CATEGORY_ICON } from '../components/icons';
import { Body, Btn, Card, Chip, H2, ServiceRow } from '../components/ui';
import { CATEGORIES, SERVICES } from '../data/services';
import { closest, search } from '../lib/search';
import { useColors } from '../theme';

interface Props {
  onOpenService: (id: string) => void;
  onRequest: (name: string) => void;
}

export function ServicesScreen({ onOpenService, onRequest }: Props) {
  const c = useColors();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('All');

  const pool = SERVICES.filter((s) => cat === 'All' || s.category === cat);
  const items = search(pool, query);
  const q = query.trim();

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <H2>Should I tip for this?</H2>
        <Body muted>Search or browse. Tap a service for the verdict and a quick calculator.</Body>
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Try movers, barista, hotel maid…"
        placeholderTextColor={c.muted}
        style={[st.search, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]}
        accessibilityLabel="Search services"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CATEGORIES.map((k) => (
          <Chip key={k} label={k} active={k === cat} icon={k === 'All' ? undefined : CATEGORY_ICON[k]} onPress={() => setCat(k)} />
        ))}
      </ScrollView>

      {items.length ? (
        <>
          <Text style={[st.count, { color: c.muted }]}>
            {q ? `${items.length} match${items.length > 1 ? 'es' : ''}` : `${items.length} services${cat === 'All' ? '' : ` in ${cat}`}`}
          </Text>
          <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
            {items.map((s, i) => <ServiceRow key={s.id} s={s} last={i === items.length - 1} onPress={() => onOpenService(s.id)} />)}
          </Card>
        </>
      ) : (
        <>
          <Card style={{ borderStyle: 'dashed' }}>
            <Body>We don't have "{q}" yet. Closest matches:</Body>
          </Card>
          <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
            {closest(SERVICES, q).map((s, i) => <ServiceRow key={s.id} s={s} last={i === 2} onPress={() => onOpenService(s.id)} />)}
          </Card>
          <Btn ghost title={`Request "${q}"`} onPress={() => onRequest(q)} />
        </>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  search: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, fontFamily: font('body') },
  count: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.7 },
});
