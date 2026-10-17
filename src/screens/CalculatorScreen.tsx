import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Icon } from '../components/icons';
import { Text } from '../components/Text';
import {
  BigMoneyField, Btn, Card, Chip, H2, Label, MoneyField, OptionButton, Pill, ProTag, Segmented, ServiceRow, Stepper, TipButtons, type TipOption,
} from '../components/ui';
import { byId, SERVICES } from '../data/services';
import { font } from '../fonts';
import { search } from '../lib/search';
import { computeFlat, computeItemized, computePct, money, normLabel, parseAmount, tipOptions, type RoundMode, type TipBase } from '../lib/tip';
import { applyPreset, newId, presetFrom, withService, type CalcState, type SplitMode } from '../state';
import { useProGate, useStore } from '../store';
import { mono, space, useColors } from '../theme';
import { canScanReceipts, ReceiptScreen } from './ReceiptScreen';

/** Default tip cards when no service is picked (Modern Mint: three cards, then Custom tip / No tip). */
const DEFAULT_PCTS = [15, 18, 20];

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
  const [customOpen, setCustomOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  const svc = state.serviceId ? byId(state.serviceId) : undefined;
  const flat = !!svc?.flat;
  const itemized = !flat && state.splitMode === 'items';
  const patch = (p: Partial<CalcState>) => setState((s) => ({ ...s, ...p }));
  const suggestions = query.trim() ? search(SERVICES, query, 5) : [];

  const bill = parseAmount(state.bill);
  const tax = parseAmount(state.tax);
  const usesServiceRange = !!(svc?.pct && svc.pct[1] > 0);
  // "No tip" has its own button, so 0 never takes a card.
  const pctValues = (usesServiceRange ? tipOptions(svc!) : DEFAULT_PCTS).filter((v) => v > 0);

  const pctResult = computePct({ bill, tax, base: state.base, pct: state.pct, round: state.round, split: state.split });
  const flatResult = computeFlat(parseAmount(state.flatAmount), state.qty, state.round, state.split);
  const itemResult = computeItemized({
    bill, tax, base: state.base, pct: state.pct, round: state.round, shared: parseAmount(state.shared),
    people: state.people.map((p, i) => ({ name: p.name.trim() || `Person ${i + 1}`, amount: parseAmount(p.amount) })),
  });

  const pctOptions: TipOption[] = pctValues.map((v) => ({
    value: v,
    top: `${v}%`,
    amount: money((pctResult.baseAmt * v) / 100),
    recommended: !!(svc?.pct && v === svc.pct[2]),
  }));

  const flatValues = svc?.flat ? tipOptions(svc).filter((v) => v > 0) : [];
  const flatOptions: TipOption[] = svc?.flat
    ? flatValues.map((v) => ({ value: v, top: `$${v}`, amount: `${money(v * state.qty)} total`, recommended: v === svc.flat![2] }))
    : [];
  const flatAmt = parseAmount(state.flatAmount);

  const isCustomPct = customOpen || (state.pct > 0 && !pctValues.includes(state.pct));
  const isCustomFlat = customOpen || (flatAmt > 0 && !flatValues.includes(flatAmt));

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

  // Numbers shown in the mint result card.
  const resultTip = flat ? flatResult.tip : itemized ? itemResult.tip : pctResult.tip;
  const resultTotal = flat ? null : itemized ? itemResult.total : pctResult.total;

  return (
    <View style={{ gap: 16 }}>
      <H2>Quick calculator</H2>

      {/* What's it for? */}
      <View>
        <View style={[st.search, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Icon name="search" color={c.muted} size={20} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="What's it for? Restaurant, valet, salon…"
            placeholderTextColor={c.muted}
            style={[st.searchInput, { color: c.ink }]}
            accessibilityLabel="What is the tip for"
            returnKeyType="search"
            onSubmitEditing={() => {
              if (suggestions[0]) {
                setState((s) => withService(s, suggestions[0]));
                setQuery('');
              }
            }}
          />
        </View>
        {query.trim() !== '' && (
          <Card style={{ padding: 0, gap: 0, marginTop: 6, overflow: 'hidden' }}>
            {suggestions.length ? (
              suggestions.map((s, i) => (
                <ServiceRow key={s.id} s={s} last={i === suggestions.length - 1} onPress={() => { setState((cur) => withService(cur, s)); setQuery(''); setCustomOpen(false); }} />
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
            style={[st.input, { flex: 1, borderColor: c.accent, backgroundColor: c.surface, color: c.ink }]}
          />
          <Btn small title="Save" onPress={savePreset} />
          <Btn small ghost title="Cancel" onPress={() => setNaming(null)} />
        </View>
      )}
      {pro && presets.length > 0 && naming === null && <Text style={{ color: c.muted, fontSize: 12, marginTop: -8 }}>Tap a preset to load it. Press and hold to delete.</Text>}

      {/* Picked service */}
      {svc && (
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ color: c.ink, fontWeight: '600', fontSize: 16 }}>{svc.name}</Text>
              <Text style={{ color: c.muted, fontSize: 14 }}>{normLabel(svc)}</Text>
            </View>
            <Pill verdict={svc.verdict} long />
          </View>
          {(svc.verdict === 'not' || svc.verdict === 'included') && <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20 }}>{svc.note}</Text>}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><Btn small ghost title="Details and stats" onPress={() => onOpenService(svc.id)} /></View>
            <View style={{ flex: 1 }}><Btn small ghost title="Clear" onPress={() => { patch({ serviceId: null }); setCustomOpen(false); }} /></View>
          </View>
        </Card>
      )}

      {/* Amount and tip choice */}
      {flat ? (
        <>
          <Card outlined style={{ gap: 14 }}>
            <Text style={{ color: c.muted, fontSize: 14 }}>Amounts are {svc!.unit}.</Text>
            <Stepper inline label={svc!.qtyLabel ?? 'Quantity'} value={state.qty} onChange={(v) => patch({ qty: v })} />
          </Card>
          <TipButtons options={flatOptions} selected={isCustomFlat ? null : flatAmt || null} onSelect={(v) => { setCustomOpen(false); patch({ flatAmount: String(v) }); }} />
          <View style={st.two}>
            <OptionButton label="Custom tip" on={isCustomFlat} onPress={() => setCustomOpen(true)} />
            <OptionButton label="No tip" on={!isCustomFlat && state.flatAmount === '0'} onPress={() => { setCustomOpen(false); patch({ flatAmount: '0' }); }} />
          </View>
          {isCustomFlat && <MoneyField label="Amount each" value={state.flatAmount} onChange={(v) => patch({ flatAmount: v })} />}
        </>
      ) : (
        <>
          <BigMoneyField label="Bill amount" value={state.bill} onChange={(v) => patch({ bill: v })} />
          <Pressable
            onPress={() => gate('Receipt scan', () => (canScanReceipts ? setScanning(true) : flash('Update the app to scan receipts')))}
            accessibilityRole="button"
            accessibilityLabel="Scan receipt and split by item"
            style={({ pressed }) => [st.scanBtn, { borderColor: c.border, backgroundColor: c.surface }, pressed && { opacity: 0.75 }]}
          >
            <Icon name="camera" color={c.accent} size={22} />
            <Text style={{ color: c.ink, fontWeight: '600', fontSize: 16, flex: 1 }}>Scan receipt and split by item</Text>
            {!pro && <ProTag />}
          </Pressable>
          <TipButtons options={pctOptions} selected={isCustomPct ? null : state.pct} onSelect={(v) => { setCustomOpen(false); patch({ pct: v }); }} />
          <View style={st.two}>
            <OptionButton label="Custom tip" on={isCustomPct} onPress={() => setCustomOpen(true)} />
            <OptionButton label="No tip" on={!isCustomPct && state.pct === 0} onPress={() => { setCustomOpen(false); patch({ pct: 0 }); }} />
          </View>
          {isCustomPct && <Stepper inline label="Custom percent" value={state.pct} min={0} max={50} suffix="%" onChange={(v) => patch({ pct: v })} />}
        </>
      )}

      {/* Result */}
      <View style={[st.result, { backgroundColor: c.result }]} accessibilityLabel={`Tip ${money(resultTip)}${resultTotal != null ? `, total ${money(resultTotal)}` : ''}`}>
        <Text style={{ color: c.onResult, fontSize: 16, fontWeight: '600' }}>Tip</Text>
        <Text style={{ color: c.onResult, fontFamily: mono, fontSize: 48, lineHeight: 56 }}>{money(resultTip)}</Text>
        {resultTotal != null ? (
          <View style={[st.resultRow, { borderTopColor: 'rgba(24,35,34,0.18)' }]}>
            <Text style={{ color: c.onResult, fontSize: 16 }}>Total</Text>
            <Text style={{ color: c.onResult, fontFamily: mono, fontSize: 28, lineHeight: 34 }}>{money(resultTotal)}</Text>
          </View>
        ) : (
          <Text style={{ color: c.onResult, fontSize: 14 }}>{state.qty} × {money(flatAmt)} {svc!.unit}</Text>
        )}
      </View>
      {!flat && bill === 0 && <Text style={{ color: c.muted, fontSize: 14, marginTop: -6 }}>Enter the bill to see your tip.</Text>}

      {/* Split */}
      {!flat && (
        <Segmented<SplitMode>
          label="Split"
          value={state.splitMode}
          onChange={(v) => (v === 'items' && !pro ? openPaywall('Split by item') : patch({ splitMode: v }))}
          options={[{ v: 'even', t: 'Evenly' }, { v: 'items', t: pro ? 'By item' : 'By item · Pro' }]}
        />
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
                style={[st.input, st.personName, { borderColor: c.border, backgroundColor: c.surface, color: c.ink }]}
                accessibilityLabel={`Name for person ${i + 1}`}
              />
              <View style={[st.smallMoney, { borderColor: c.border, backgroundColor: c.surface }]}>
                <Text style={{ color: c.muted, fontFamily: mono }}>$</Text>
                <TextInput
                  value={p.amount}
                  onChangeText={(t) => setPerson(p.id, { amount: t.replace(/[^0-9.]/g, '') })}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={c.muted}
                  style={{ flex: 1, color: c.ink, fontFamily: font('mono'), fontSize: 16, paddingVertical: 10, paddingHorizontal: 4, fontVariant: ['tabular-nums'] }}
                  accessibilityLabel={`Amount for ${p.name || `person ${i + 1}`}`}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${p.name || `person ${i + 1}`}`}
                disabled={state.people.length <= 1}
                onPress={() => setState((s) => ({ ...s, people: s.people.filter((x) => x.id !== p.id) }))}
                style={[st.remove, { opacity: state.people.length <= 1 ? 0.35 : 1 }]}
              >
                <View style={[st.removeDot, { backgroundColor: c.sunk }]}>
                  <Icon name="minus" color={c.ink} size={18} />
                </View>
              </Pressable>
            </View>
          ))}
          <View style={st.two}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Btn small ghost title="+ Add person" onPress={() => setState((s) => ({ ...s, people: [...s.people, { id: newId(), name: '', amount: '' }] }))} />
            </View>
            <MoneyField label="Shared items" value={state.shared} onChange={(v) => patch({ shared: v })} />
          </View>
          <Card style={{ gap: 0, padding: 0, overflow: 'hidden' }}>
            {itemResult.shares.map((sh, i) => (
              <View key={state.people[i].id} style={[st.share, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ color: c.ink, fontWeight: '600', fontSize: 16 }}>{sh.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 13, fontFamily: mono }}>
                    {money(sh.food)} + {money(sh.tax)} tax + {money(sh.tip)} tip
                  </Text>
                </View>
                <Text style={{ color: c.ink, fontFamily: mono, fontSize: 22 }}>{money(sh.total)}</Text>
              </View>
            ))}
          </Card>
          {itemResult.unassigned > 0.004 && bill > 0 && (
            <Text style={{ color: c.muted, fontSize: 14 }}>{money(itemResult.unassigned)} isn't assigned to anyone, so it's split evenly.</Text>
          )}
          {itemResult.over > 0.004 && (
            <Text style={{ color: c.warn, fontSize: 14 }}>The amounts add up to {money(itemResult.over)} more than the bill before tax. Check them.</Text>
          )}
          {Math.abs(itemResult.collected - itemResult.total) > 0.004 && (
            <Text style={{ color: c.muted, fontSize: 14 }}>Shares are rounded up to the cent, so the group covers {money(itemResult.collected)}.</Text>
          )}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <Stepper inline label="Split between" value={state.split} max={20} onChange={(v) => patch({ split: v })} />
          {state.split > 1 && (
            <View style={st.eachRow}>
              <Text style={{ color: c.muted, fontSize: 16 }}>Each person</Text>
              <Text style={{ color: c.ink, fontFamily: mono, fontSize: 34, lineHeight: 40 }}>{money(flat ? flatResult.each : pctResult.each)}</Text>
            </View>
          )}
          {!flat && state.split > 1 && Math.abs(pctResult.groupPays - pctResult.total) > 0.004 && (
            <Text style={{ color: c.muted, fontSize: 14 }}>Each share is rounded up to the cent, so the group covers {money(pctResult.groupPays)}.</Text>
          )}
        </View>
      )}

      {/* Tax and rounding */}
      <Card style={{ gap: 14 }}>
        {!flat && (
          <>
            <MoneyField label="Tax on the bill (optional)" value={state.tax} onChange={(v) => patch({ tax: v })} />
            <Segmented<TipBase> label="Tip on" value={state.base} onChange={(v) => patch({ base: v })} options={[{ v: 'pre', t: 'Pre-tax amount' }, { v: 'post', t: 'Full bill' }]} />
          </>
        )}
        <Segmented<RoundMode> label="Round up" value={state.round} onChange={(v) => patch({ round: v })} options={[{ v: 'none', t: 'Off' }, { v: 'tip', t: 'Tip' }, { v: 'total', t: 'Total' }]} />
        {!flat && !itemized && state.round !== 'none' && bill > 0 && (
          <Text style={{ color: c.muted, fontSize: 14 }}>After rounding, the tip is {pctResult.effectivePct.toFixed(1)}% of {money(pctResult.baseAmt)}.</Text>
        )}
      </Card>

      <Pressable onPress={saveToHistory} accessibilityRole="button" style={({ pressed }) => [st.saveBtn, { borderColor: c.border, backgroundColor: c.surface }, pressed && { opacity: 0.75 }]}>
        <Text style={{ color: c.ink, fontWeight: '600', fontSize: 16 }}>Save to history</Text>
        {!pro && <ProTag />}
      </Pressable>

      {!svc && <Text style={{ color: c.muted, fontSize: 14, textAlign: 'center' }}>Not sure what to tip? Type what it's for in the search box above.</Text>}

      <ReceiptScreen
        visible={scanning}
        people={state.people.map((p) => ({ id: p.id, name: p.name }))}
        onClose={() => setScanning(false)}
        onUse={(r) => {
          setState((s) => ({
            ...s,
            bill: r.bill,
            tax: r.tax,
            shared: r.shared,
            people: r.people,
            splitMode: 'items',
            pct: r.tipIncluded ? 0 : s.pct,
          }));
          setCustomOpen(false);
          setScanning(false);
          flash(r.tipIncluded ? 'Receipt added. A service charge is already on it.' : 'Receipt added. Each share is below.');
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: space.controlRadius + 2, paddingHorizontal: 14, minHeight: 52 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: font('body'), paddingVertical: 12 },
  input: { borderWidth: 1.5, borderRadius: space.controlRadius, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: font('body'), minHeight: space.target },
  two: { flexDirection: 'row', gap: 10 },
  result: { borderRadius: space.cardRadius, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18, gap: 2 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderTopWidth: 1, marginTop: 10, paddingTop: 12 },
  eachRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  personRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  personName: { flex: 1, minWidth: 0, paddingHorizontal: 12 },
  smallMoney: { width: 116, minHeight: space.target, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: space.controlRadius, paddingHorizontal: 10 },
  remove: { width: space.target, height: space.target, alignItems: 'center', justifyContent: 'center' },
  removeDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  share: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 16 },
  scanBtn: { flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1.5, borderRadius: space.controlRadius, minHeight: 52, paddingHorizontal: 16, marginTop: -4 },
  saveBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: space.controlRadius, minHeight: 52 },
});
