import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { font } from '../fonts';
import { Text } from '../components/Text';
import { CATEGORY_ICON, Icon } from '../components/icons';
import { Body, Btn, Chip, H2, H3, ServiceRow } from '../components/ui';
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
    <View style={{ gap: 14 }}>
      <View style={{ gap: 4 }}>
        <H2>Find your answer</H2>
        <Body muted>Search or browse. Tap a service for the verdict, the reason, and a quick calculator.</Body>
      </View>
      <View style={[st.search, { borderColor: c.border, backgroundColor: c.surface }]}>
        <Icon name="search" color={c.muted} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search a service"
          placeholderTextColor={c.muted}
          style={[st.searchInput, { color: c.ink }]}
          accessibilityLabel="Search services"
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CATEGORIES.map((k) => (
          <Chip key={k} label={k} active={k === cat} icon={k === 'All' ? undefined : CATEGORY_ICON[k]} onPress={() => setCat(k)} />
        ))}
      </ScrollView>

      {items.length ? (
        <>
          <View style={st.guideHead}>
            <H3>Tipping guide</H3>
            <Text style={{ color: c.muted, fontSize: 14 }}>
              {q ? `${items.length} match${items.length > 1 ? 'es' : ''}` : `${items.length} services${cat === 'All' ? '' : ` in ${cat}`}`}
            </Text>
          </View>
          <View style={{ gap: 10 }}>
            {items.map((s) => <ServiceRow key={s.id} s={s} variant="card" onPress={() => onOpenService(s.id)} />)}
          </View>
        </>
      ) : (
        <>
          <Body>We don't have "{q}" yet. Closest matches:</Body>
          <View style={{ gap: 10 }}>
            {closest(SERVICES, q).map((s) => <ServiceRow key={s.id} s={s} variant="card" onPress={() => onOpenService(s.id)} />)}
          </View>
          <Btn ghost title={`Request "${q}"`} onPress={() => onRequest(q)} />
        </>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, minHeight: 52 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: font('body'), paddingVertical: 12 },
  guideHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
});
