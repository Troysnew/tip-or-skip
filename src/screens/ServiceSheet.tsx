import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bars, Body, Btn, Card, H3, MoneyField, Stepper, TipButtons, type TipOption } from '../components/ui';
import { VERDICT_TEXT, byId, type Service } from '../data/services';
import { BANKRATE, FREQ, PEW, PEW_AMOUNT, PEW_LABEL } from '../data/surveys';
import { canCalculate, computePct, defaultOption, money, normLabel, optionLabel, parseAmount, tipOptions } from '../lib/tip';
import type { CalcState } from '../state';
import { useStore } from '../store';
import { mono, useColors, verdictColors } from '../theme';

interface Props {
  serviceId: string | null;
  onClose: () => void;
  calc: CalcState;
  setBill: (bill: string, tax: string) => void;
  onSendToCalculator: (s: Service, choice: number, qty: number) => void;
}

const pollOptions = (s: Service) => {
  if (s.flat) {
    const [lo, hi] = s.flat;
    return ["Didn't tip", `$${lo}`, `$${Math.round((lo + hi) / 2)}`, `$${hi}`, 'More'];
  }
  return ["Didn't tip", 'Under 15%', '15%', '18%', '20%', 'Over 20%'];
};

export function ServiceSheet({ serviceId, onClose, calc, setBill, onSendToCalculator }: Props) {
  const c = useColors();
  const { polls, setPolls } = useStore();
  const onVote = (id: string, answer: string) => setPolls((p) => ({ ...p, [id]: answer }));
  const insets = useSafeAreaInsets();
  const s = serviceId ? byId(serviceId) : undefined;
  const [choice, setChoice] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (s) {
      setChoice(defaultOption(s));
      setQty(1);
    }
  }, [serviceId]);

  if (!s) return null;
  const vc = verdictColors(c, s.verdict);
  const calcable = canCalculate(s);
  const mine = polls[s.id];

  const bill = parseAmount(calc.bill);
  const tax = parseAmount(calc.tax);
  const { baseAmt } = computePct({ bill, tax, base: 'pre', pct: 0, round: 'none', split: 1 });

  const options: TipOption[] = calcable
    ? tipOptions(s).map((v) =>
        s.flat
          ? { value: v, top: `$${v} each`, amount: money(v * qty), sub: optionLabel(s, v), recommended: v === s.flat[2] }
          : { value: v, top: v === 0 ? 'No tip' : `${v}%`, amount: money((baseAmt * v) / 100), sub: optionLabel(s, v), recommended: v === s.pct![2] && v > 0 }
      )
    : [];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} onPress={onClose} accessibilityLabel="Close" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.wrap} pointerEvents="box-none">
        <View style={[st.sheet, { backgroundColor: c.bg, paddingBottom: insets.bottom + 16 }]}>
          <View style={[st.grab, { backgroundColor: c.line }]} />
          <ScrollView contentContainerStyle={{ gap: 14, paddingHorizontal: 16, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
            <View style={st.head}>
              <View style={{ flex: 1 }}>
                <Text style={[st.eyebrow, { color: c.muted }]}>{s.category}</Text>
                <Text style={[st.title, { color: c.ink }]}>{s.name}</Text>
              </View>
              <Pressable onPress={onClose} accessibilityLabel="Close" style={[st.x, { backgroundColor: c.sunk }]}>
                <Text style={{ color: c.ink, fontSize: 18 }}>×</Text>
              </Pressable>
            </View>

            <View style={[st.verdict, { backgroundColor: vc.bg }]}>
              <Text style={[st.eyebrow, { color: vc.fg }]}>Should I tip?</Text>
              <Text style={[st.answer, { color: vc.fg }]}>{VERDICT_TEXT[s.verdict].answer}</Text>
              <Text style={{ color: c.ink, fontFamily: mono, fontWeight: '700', fontSize: 16 }}>{normLabel(s)}</Text>
            </View>

            {calcable && (
              <Card>
                <H3>Work it out</H3>
                {s.flat ? (
                  <>
                    <Body muted small>Amounts are {s.unit}.</Body>
                    <Stepper label={s.qtyLabel ?? 'Quantity'} value={qty} onChange={setQty} />
                  </>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <MoneyField label="Bill total" value={calc.bill} onChange={(v) => setBill(v, calc.tax)} />
                    <MoneyField label="Tax (optional)" value={calc.tax} onChange={(v) => setBill(calc.bill, v)} />
                  </View>
                )}
                <TipButtons options={options} selected={choice} onSelect={setChoice} />
                <View style={[st.result, { borderTopColor: c.line }]}>
                  {s.flat ? (
                    <>
                      <Text style={{ color: c.muted }}>Tip for {qty} {(s.qtyLabel ?? 'items').toLowerCase()}</Text>
                      <Text style={[st.resultNum, { color: c.accent }]}>{money(choice * qty)}</Text>
                    </>
                  ) : bill > 0 ? (
                    <>
                      <Text style={{ color: c.muted }}>Total with tip</Text>
                      <Text style={[st.resultNum, { color: c.accent }]}>{money(bill + (baseAmt * choice) / 100)}</Text>
                    </>
                  ) : (
                    <Text style={{ color: c.muted }}>Enter the bill to see your tip</Text>
                  )}
                </View>
                {!s.flat && <Body muted small>{tax > 0 ? `Tip figured on ${money(baseAmt)}, the amount before tax.` : 'Add the tax to tip on the pre-tax amount.'}</Body>}
              </Card>
            )}

            <Card>
              <Body>{s.note}</Body>
              {s.sourceUrl ? (
                <Text accessibilityRole="link" onPress={() => Linking.openURL(s.sourceUrl!)} style={{ color: c.muted, fontSize: 13 }}>
                  Guidance: <Text style={{ color: c.accent, fontWeight: '600', textDecorationLine: 'underline' }}>{s.source}</Text>
                </Text>
              ) : (
                <Body muted small>Guidance: {s.source}. Source check pending.</Body>
              )}
            </Card>

            {s.pew && (
              <Card>
                <H3>How often people tip for {PEW_LABEL[s.pew]}</H3>
                <Bars rows={PEW[s.pew].map((v, i) => [FREQ[i], v] as [string, number])} max={100} />
                <Body muted small>Pew Research Center, 11,945 U.S. adults who use the service, Aug 2023.</Body>
              </Card>
            )}
            {s.amountStats && (
              <Card>
                <H3>What people tip for an average meal</H3>
                <Bars rows={PEW_AMOUNT} max={40} />
                <Body muted small>15% is the most common answer. About a quarter tip 20% or more. Pew Research Center, Aug 2023.</Body>
              </Card>
            )}
            {s.bankrate && (
              <Card>
                <H3>Always tip</H3>
                <Bars rows={[['2025', BANKRATE[s.bankrate]]]} max={100} />
                <Body muted small>Bankrate tipping survey, 2,445 U.S. adults, April 2025.{s.id === 'stylist' ? ' Asked about hair stylists and barbers together.' : ''}</Body>
              </Card>
            )}
            {!s.pew && !s.amountStats && !s.bankrate && (
              <Card>
                <H3>What people tip</H3>
                <View style={[st.nodata, { backgroundColor: c.sunk }]}>
                  <Body muted small>No published survey covers this service yet. In-app responses will fill this in once 50 people answer.</Body>
                </View>
              </Card>
            )}

            <Card>
              <H3>What did you tip?</H3>
              <Body muted small>Your answer builds the community numbers for this service.</Body>
              <View style={st.poll}>
                {pollOptions(s).map((o) => {
                  const on = mine === o;
                  return (
                    <Pressable key={o} onPress={() => onVote(s.id, o)} accessibilityState={{ selected: on }} style={[st.pollBtn, { borderColor: on ? c.accent : c.line, backgroundColor: on ? c.accent : 'transparent' }]}>
                      <Text style={{ color: on ? c.accentInk : c.ink, fontWeight: '600', fontSize: 13 }}>{o}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Body muted small>{mine ? 'Saved on this phone. Community results show at 50 responses.' : 'Community results: 0 of 50 responses needed.'}</Body>
            </Card>

            {calcable && <Btn ghost title="Split or round this" onPress={() => onSendToCalculator(s, choice, qty)} />}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8 },
  grab: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 10 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  eyebrow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontFamily: 'display', fontSize: 23, fontWeight: '800', letterSpacing: -0.3 },
  x: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  verdict: { borderRadius: 14, padding: 16, gap: 6 },
  answer: { fontFamily: 'display', fontSize: 27, fontWeight: '800' },
  result: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderTopWidth: 2, borderStyle: 'dashed', paddingTop: 10 },
  resultNum: { fontFamily: mono, fontWeight: '700', fontSize: 24 },
  nodata: { borderRadius: 10, padding: 12 },
  poll: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pollBtn: { borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
});
