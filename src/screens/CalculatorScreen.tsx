import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { font } from '../fonts';
import { Text } from '../components/Text';
import { Btn, Card, Chip, Label, MoneyField, Pill, ProTag, Segmented, ServiceRow, Stepper, TipButtons, type TipOption } from '../components/ui';
import { byId, SERVICES } from '../data/services';
import { search } from '../lib/search';
import { computeFlat, computeItemized, computePct, money, normLabel, optionLabel, parseAmount, tipOptions, type RoundMode, type TipBase } from '../lib/tip';
import { applyPreset, newId, presetFrom, withService, type CalcState, type SplitMode } from '../state';
import { useProGate, useStore } from '../store';
import { mono, useColors } from '../theme';

const DEFAULT_PCTS = [15, 18, 20, 22, 25];

interface Props {
  state: CalcState;
  setState: React.Dispatch<React.SetStateAction<CalcState>>;
  onOpenService: (id: string) => void;
}

export function CalculatorScreen({ state, setState, onOpenService }: Props) {
  const c = useColors();
  const { pro, presets, setPresets, setHistory, flash, openPaywall } = useStore();
  const gate = useProGate();
  const [query, setQuery] = useState('');
  const [naming, setNaming] = useState<string | null>(null);

  const svc = state.serviceId ? byId(state.serviceId) : undefined;
  const flat = !!svc?.flat;
  const itemized = !flat && state.splitMode === 'items';
  const patch = (p: Partial<CalcState>) => setState((s) => ({ ...s, ...p }));
  const suggestions = query.trim() ? search(SERVICES, query, 5) : [];

  const bill = parseAmount(state.bill);
  const tax = parseAmount(state.tax);
  const usesServiceRange = !!(svc?.pct && svc.pct[1] > 0);
  const pctValues = usesServiceRange ? tipOptions(svc!) : DEFAULT_PCTS;

  const pctResult = computePct({ bill, tax, base: state.base, pct: state.pct, round: state.round, split: state.split });
  const flatResult = computeFlat(parseAmount(state.flatAmount), state.qty, state.round, state.split);
  const itemResult = computeItemized({
    bill, tax, base: state.base, pct: state.pct, round: state.round, shared: parseAmount(state.shared),
    people: state.people.map((p, i) => ({ name: p.name.trim() || `Person ${i + 1}`, amount: parseAmount(p.amount) })),
  });

  const pctOptions: TipOption[] = pctValues.map((v) => ({
    value: v,
    top: v === 0 ? 'No tip' : `${v}%`,
    amount: money((pctResult.baseAmt * v) / 100),
    sub: usesServiceRange ? optionLabel(svc!, v) : '',
    recommended: !!(svc?.pct && v === svc.pct[2] && v > 0),
  }));

  const flatOptions: TipOption[] = svc?.flat
    ? tipOptions(svc).map((v) => ({ value: v, top: `$${v} each`, amount: money(v * state.qty), sub: optionLabel(svc, v), recommended: v === svc.flat![2] }))
    : [];

  const setPerson = (id: string, p: { name?: string; amount?: string }) =>
    setState((s) => ({ ...s, people: s.people.map((x) => (x.id === id ? { ...x, ...p } : x)) }));

  const saveToHistory = () =>
    gate('Tip history', () => {
      const entry = flat
        ? { bill: 0, tip: flatResult.tip, total: flatResult.tip, pct: null, split: state.split }
        : itemized
          ? { bill: itemResult.total - itemResult.tip, tip: itemResult.tip, total: itemResult.total, pct: state.pct, split: state.people.length }
          : { bill, tip: pctResult.tip, total: pctResult.total, pct: state.pct, split: state.split };
      if (entry.tip <= 0 && entry.total <= 0) {
        flash('Enter the bill first');
        return;
      }
      setHistory((h) => [{ id: newId(), at: Date.now(), serviceId: state.serviceId, label: svc?.name ?? 'Tip', ...entry }, ...h]);
      flash('Saved to history');
    });

  const savePreset = () => {
    const name = (naming ?? '').trim();
    if (!name) return;
    setPresets((p) => [...p, presetFrom(state, name)]);
    setNaming(null);
    flash(`Saved "${name}"`);
  };

  return (
    <View style={{ gap: 14 }}>
      {/* Service picker */}
      <View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="What's it for? Restaurant, valet, salon…"
          placeholderTextColor={c.muted}
          style={[st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]}
          accessibilityLabel="What is the tip for"
          returnKeyType="search"
          onSubmitEditing={() => {
            if (suggestions[0]) {
              setState((s) => withService(s, suggestions[0]));
              setQuery('');
            }
          }}
        />
        {query.trim() !== '' && (
          <Card style={{ padding: 0, gap: 0, marginTop: 6, overflow: 'hidden' }}>
            {suggestions.length ? (
              suggestions.map((s, i) => (
                <ServiceRow key={s.id} s={s} last={i === suggestions.length - 1} onPress={() => { setState((cur) => withService(cur, s)); setQuery(''); }} />
              ))
            ) : (
              <Text style={{ color: c.muted, padding: 16 }}>No match yet. Try the Services tab to request it.</Text>
            )}
          </Card>
        )}
      </View>

      {/* Presets */}
      {naming === null ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
          {pro && presets.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              onPress={() => setState((s) => applyPreset(s, p))}
              onLongPress={() =>
                Alert.alert('Delete preset?', `"${p.name}" will be removed.`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => setPresets((all) => all.filter((x) => x.id !== p.id)) },
                ])
              }
            />
          ))}
          <Chip label="+ Save as preset" locked={!pro} onPress={() => gate('Saved presets', () => setNaming(''))} />
        </ScrollView>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            autoFocus
            value={naming}
            onChangeText={setNaming}
            placeholder="Preset name, e.g. Team lunch"
            placeholderTextColor={c.muted}
            onSubmitEditing={savePreset}
            returnKeyType="done"
            style={[st.input, { flex: 1, paddingVertical: 9, borderColor: c.accent, backgroundColor: c.surface, color: c.ink }]}
          />
          <Btn small title="Save" onPress={savePreset} />
          <Btn small ghost title="Cancel" onPress={() => setNaming(null)} />
        </View>
      )}
      {pro && presets.length > 0 && naming === null && <Text style={{ color: c.muted, fontSize: 12, marginTop: -8 }}>Tap a preset to load it. Press and hold to delete.</Text>}

      <Card style={{ gap: 16 }}>
        {svc && (
          <View style={[st.ctx, { backgroundColor: c.sunk }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ color: c.ink, fontWeight: '700' }}>{svc.name}</Text>
                <Text style={{ color: c.muted, fontFamily: mono, fontSize: 12 }}>{normLabel(svc)}</Text>
              </View>
              <Pill verdict={svc.verdict} long />
            </View>
            {(svc.verdict === 'not' || svc.verdict === 'included') && <Text style={{ color: c.muted, fontSize: 13 }}>{svc.note}</Text>}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Btn small ghost title="Details and stats" onPress={() => onOpenService(svc.id)} /></View>
              <View style={{ flex: 1 }}><Btn small ghost title="Clear" onPress={() => patch({ serviceId: null })} /></View>
            </View>
          </View>
        )}

        {flat ? (
          <>
            <Text style={{ color: c.muted, fontSize: 13 }}>Amounts are {svc!.unit}.</Text>
            <View style={st.two}>
              <MoneyField label="Amount each" value={state.flatAmount} onChange={(v) => patch({ flatAmount: v })} />
              <Stepper label={svc!.qtyLabel ?? 'Quantity'} value={state.qty} onChange={(v) => patch({ qty: v })} />
            </View>
            <TipButtons options={flatOptions} selected={parseAmount(state.flatAmount) || (state.flatAmount === '0' ? 0 : null)} onSelect={(v) => patch({ flatAmount: String(v) })} />
          </>
        ) : (
          <>
            <View style={st.two}>
              <MoneyField label="Bill total" value={state.bill} onChange={(v) => patch({ bill: v })} />
              <MoneyField label="Tax (optional)" value={state.tax} onChange={(v) => patch({ tax: v })} />
            </View>
            <Segmented<TipBase> label="Tip on" value={state.base} onChange={(v) => patch({ base: v })} options={[{ v: 'pre', t: 'Pre-tax amount' }, { v: 'post', t: 'Full bill' }]} />
            <View>
              <Label>Tip</Label>
              <TipButtons options={pctOptions} selected={state.pct} onSelect={(v) => patch({ pct: v })} />
            </View>
            <Stepper label="Custom percent" value={state.pct} min={0} max={50} suffix="%" onChange={(v) => patch({ pct: v })} />
            <Segmented<SplitMode>
              label="Split"
              value={state.splitMode}
              onChange={(v) => (v === 'items' && !pro ? openPaywall('Split by item') : patch({ splitMode: v }))}
              options={[{ v: 'even', t: 'Evenly' }, { v: 'items', t: pro ? 'By item' : 'By item · Pro' }]}
            />
          </>
        )}

        {itemized ? (
          <View style={{ gap: 10 }}>
            <Label>What each person ordered (before tax)</Label>
            {state.people.map((p, i) => (
              <View key={p.id} style={st.personRow}>
                <TextInput
                  value={p.name}
                  onChangeText={(t) => setPerson(p.id, { name: t })}
                  placeholder={`Person ${i + 1}`}
                  placeholderTextColor={c.muted}
                  style={[st.input, st.personName, { borderColor: c.line, backgroundColor: c.bg, color: c.ink }]}
                  accessibilityLabel={`Name for person ${i + 1}`}
                />
                <View style={[st.smallMoney, { borderColor: c.line, backgroundColor: c.bg }]}>
                  <Text style={{ color: c.muted, fontFamily: mono }}>$</Text>
                  <TextInput
                    value={p.amount}
                    onChangeText={(t) => setPerson(p.id, { amount: t.replace(/[^0-9.]/g, '') })}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={c.muted}
                    style={{ flex: 1, color: c.ink, fontFamily: font('mono', 700), fontSize: 16, paddingVertical: 8, paddingHorizontal: 4 }}
                    accessibilityLabel={`Amount for ${p.name || `person ${i + 1}`}`}
                  />
                </View>
                <Pressable
                  accessibilityLabel={`Remove ${p.name || `person ${i + 1}`}`}
                  disabled={state.people.length <= 1}
                  onPress={() => setState((s) => ({ ...s, people: s.people.filter((x) => x.id !== p.id) }))}
                  style={[st.remove, { backgroundColor: c.sunk, opacity: state.people.length <= 1 ? 0.35 : 1 }]}
                >
                  <Text style={{ color: c.ink, fontSize: 16 }}>×</Text>
                </Pressable>
              </View>
            ))}
            <View style={st.two}>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Btn small ghost title="+ Add person" onPress={() => setState((s) => ({ ...s, people: [...s.people, { id: newId(), name: '', amount: '' }] }))} />
              </View>
              <MoneyField label="Shared items" value={state.shared} onChange={(v) => patch({ shared: v })} />
            </View>
            <Segmented<RoundMode> label="Round up" value={state.round} onChange={(v) => patch({ round: v })} options={[{ v: 'none', t: 'Off' }, { v: 'tip', t: 'Tip' }, { v: 'total', t: 'Total' }]} />
          </View>
        ) : (
          <View style={st.two}>
            <Stepper label="Split" value={state.split} max={20} onChange={(v) => patch({ split: v })} />
            <Segmented<RoundMode> label="Round up" value={state.round} onChange={(v) => patch({ round: v })} options={[{ v: 'none', t: 'Off' }, { v: 'tip', t: 'Tip' }, { v: 'total', t: 'Total' }]} />
          </View>
        )}

        <View style={[st.totals, { borderTopColor: c.line }]}>
          {flat ? (
            <>
              <Line k="Tip" v={money(flatResult.tip)} big />
              {state.split > 1 && <Line k={`Each of ${state.split}`} v={money(flatResult.each)} />}
              <Text style={{ color: c.muted, fontSize: 13 }}>{state.qty} × {money(parseAmount(state.flatAmount))} {svc!.unit}</Text>
            </>
          ) : itemized ? (
            <>
              <Line k="Tip" v={money(itemResult.tip)} />
              <Line k="Total" v={money(itemResult.total)} />
              {itemResult.shares.map((sh, i) => (
                <View key={state.people[i].id} style={[st.share, { borderColor: c.line }]}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ color: c.ink, fontWeight: '700' }}>{sh.name}</Text>
                    <Text style={{ color: c.muted, fontSize: 12, fontFamily: mono }}>
                      {money(sh.food)} + {money(sh.tax)} tax + {money(sh.tip)} tip
                    </Text>
                  </View>
                  <Text style={{ color: c.accent, fontFamily: mono, fontWeight: '700', fontSize: 20 }}>{money(sh.total)}</Text>
                </View>
              ))}
              {itemResult.unassigned > 0.004 && bill > 0 && (
                <Text style={{ color: c.muted, fontSize: 13 }}>{money(itemResult.unassigned)} isn't assigned to anyone, so it's split evenly.</Text>
              )}
              {itemResult.over > 0.004 && (
                <Text style={{ color: c.warn, fontSize: 13 }}>The amounts add up to {money(itemResult.over)} more than the bill before tax. Check them.</Text>
              )}
              {Math.abs(itemResult.collected - itemResult.total) > 0.004 && (
                <Text style={{ color: c.muted, fontSize: 13 }}>Shares are rounded up to the cent, so the group covers {money(itemResult.collected)}.</Text>
              )}
            </>
          ) : (
            <>
              <Line k={`Tip on ${money(pctResult.baseAmt)}`} v={money(pctResult.tip)} />
              <Line k="Total" v={money(pctResult.total)} />
              <Line k={state.split > 1 ? `Each of ${state.split}` : 'You pay'} v={money(state.split > 1 ? pctResult.each : pctResult.total)} big />
              {bill === 0 && <Text style={{ color: c.muted, fontSize: 13 }}>Enter the bill to see your tip.</Text>}
              {state.round !== 'none' && bill > 0 && <Text style={{ color: c.muted, fontSize: 13 }}>After rounding, the tip is {pctResult.effectivePct.toFixed(1)}% of {money(pctResult.baseAmt)}.</Text>}
              {state.split > 1 && Math.abs(pctResult.groupPays - pctResult.total) > 0.004 && (
                <Text style={{ color: c.muted, fontSize: 13 }}>Each share is rounded up to the cent, so the group covers {money(pctResult.groupPays)}.</Text>
              )}
            </>
          )}
        </View>

        <Pressable onPress={saveToHistory} accessibilityRole="button" style={({ pressed }) => [st.saveBtn, { borderColor: c.accent }, pressed && { opacity: 0.7 }]}>
          <Text style={{ color: c.accent, fontWeight: '700' }}>Save to history</Text>
          {!pro && <ProTag />}
        </Pressable>
      </Card>

      {!svc && <Text style={{ color: c.muted, fontSize: 13, textAlign: 'center' }}>Not sure what to tip? Type what it's for in the box above.</Text>}
    </View>
  );
}

function Line({ k, v, big }: { k: string; v: string; big?: boolean }) {
  const c = useColors();
  return (
    <View style={st.line}>
      <Text style={{ color: big ? c.ink : c.muted, fontWeight: big ? '700' : '400' }}>{k}</Text>
      <Text style={{ color: big ? c.accent : c.ink, fontFamily: mono, fontWeight: '700', fontSize: big ? 28 : 15 }}>{v}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, fontFamily: font('body') },
  ctx: { borderRadius: 10, padding: 12, gap: 10 },
  two: { flexDirection: 'row', gap: 12 },
  totals: { borderTopWidth: 2, borderStyle: 'dashed', paddingTop: 14, gap: 6 },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  personRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  personName: { flex: 1, minWidth: 0, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 10, fontSize: 15 },
  smallMoney: { width: 112, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 8 },
  remove: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  share: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, paddingTop: 8 },
  saveBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 12, paddingVertical: 12 },
});
