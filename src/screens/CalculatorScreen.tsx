import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Btn, Card, Label, MoneyField, Pill, Segmented, ServiceRow, Stepper, TipButtons, type TipOption } from '../components/ui';
import { byId, SERVICES } from '../data/services';
import { search } from '../lib/search';
import { computeFlat, computePct, money, normLabel, optionLabel, parseAmount, tipOptions, type RoundMode, type TipBase } from '../lib/tip';
import { withService, type CalcState } from '../state';
import { mono, useColors } from '../theme';

const DEFAULT_PCTS = [15, 18, 20, 22, 25];

interface Props {
  state: CalcState;
  setState: React.Dispatch<React.SetStateAction<CalcState>>;
  onOpenService: (id: string) => void;
}

export function CalculatorScreen({ state, setState, onOpenService }: Props) {
  const c = useColors();
  const [query, setQuery] = useState('');
  const svc = state.serviceId ? byId(state.serviceId) : undefined;
  const flat = !!svc?.flat;
  const patch = (p: Partial<CalcState>) => setState((s) => ({ ...s, ...p }));
  const suggestions = query.trim() ? search(SERVICES, query, 5) : [];

  const bill = parseAmount(state.bill);
  const tax = parseAmount(state.tax);
  const usesServiceRange = !!(svc?.pct && svc.pct[1] > 0);
  const pctValues = usesServiceRange ? tipOptions(svc!) : DEFAULT_PCTS;

  const pctResult = computePct({ bill, tax, base: state.base, pct: state.pct, round: state.round, split: state.split });
  const flatResult = computeFlat(parseAmount(state.flatAmount), state.qty, state.round, state.split);

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

  return (
    <View style={{ gap: 14 }}>
      {/* Service picker */}
      <View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="What's it for? Restaurant, valet, salon…"
          placeholderTextColor={c.muted}
          style={[st.search, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]}
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
          </>
        )}

        <View style={st.two}>
          <Stepper label="Split" value={state.split} max={20} onChange={(v) => patch({ split: v })} />
          <Segmented<RoundMode> label="Round up" value={state.round} onChange={(v) => patch({ round: v })} options={[{ v: 'none', t: 'Off' }, { v: 'tip', t: 'Tip' }, { v: 'total', t: 'Total' }]} />
        </View>

        <View style={[st.totals, { borderTopColor: c.line }]}>
          {flat ? (
            <>
              <Line k="Tip" v={money(flatResult.tip)} big />
              {state.split > 1 && <Line k={`Each of ${state.split}`} v={money(flatResult.each)} />}
              <Text style={{ color: c.muted, fontSize: 13 }}>{state.qty} × {money(parseAmount(state.flatAmount))} {svc!.unit}</Text>
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
  search: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16 },
  ctx: { borderRadius: 10, padding: 12, gap: 10 },
  two: { flexDirection: 'row', gap: 12 },
  totals: { borderTopWidth: 2, borderStyle: 'dashed', paddingTop: 14, gap: 6 },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
