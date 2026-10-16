import React from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { font } from '../fonts';
import { Text } from './Text';
import { VERDICT_TEXT, type Service, type Verdict } from '../data/services';
import { normLabel } from '../lib/tip';
import { Icon, VerdictMark, type IconName } from './icons';
import { mono, useColors, verdictColors } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }, style]}>{children}</View>;
}

export function H2({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[s.h2, { color: c.ink }]}>{children}</Text>;
}

export function H3({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[s.h3, { color: c.ink }]}>{children}</Text>;
}

export function Body({ children, muted, small }: { children: React.ReactNode; muted?: boolean; small?: boolean }) {
  const c = useColors();
  return <Text style={{ color: muted ? c.muted : c.ink, fontSize: small ? 14 : 16, lineHeight: small ? 20 : 23 }}>{children}</Text>;
}

export function Label({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[s.label, { color: c.muted }]}>{children}</Text>;
}

export function Pill({ verdict, long }: { verdict: Verdict; long?: boolean }) {
  const c = useColors();
  const vc = verdictColors(c, verdict);
  return (
    <View style={[s.pill, long && s.pillLarge, { backgroundColor: vc.bg }]} accessibilityLabel={`Verdict: ${long ? VERDICT_TEXT[verdict].answer : VERDICT_TEXT[verdict].short}`}>
      <VerdictMark verdict={verdict} color={vc.fg} size={long ? 13 : 11} />
      <Text style={[s.pillText, long && { fontSize: 14 }, { color: vc.fg }]}>{long ? VERDICT_TEXT[verdict].answer : VERDICT_TEXT[verdict].short}</Text>
    </View>
  );
}

export function Btn({ title, onPress, ghost, small }: { title: string; onPress: () => void; ghost?: boolean; small?: boolean }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        small && { paddingVertical: 8, paddingHorizontal: 12 },
        ghost ? { borderWidth: 1.5, borderColor: c.accent } : { backgroundColor: c.accent },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={{ color: ghost ? c.accent : c.accentInk, fontWeight: '700', fontSize: small ? 13 : 15 }}>{title}</Text>
    </Pressable>
  );
}

export function MoneyField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Label>{label}</Label>
      <View style={[s.money, { borderColor: c.border, backgroundColor: c.bg }]}>
        <Text style={{ color: c.muted, fontFamily: mono }}>$</Text>
        <TextInput
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          placeholder={placeholder ?? '0.00'}
          placeholderTextColor={c.muted}
          style={[s.moneyInput, { color: c.ink }]}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

export function Stepper({ label, value, onChange, min = 1, max = 99, suffix = '' }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) {
  const c = useColors();
  const btn = (txt: string, next: number, a11y: string) => (
    <Pressable accessibilityLabel={a11y} onPress={() => onChange(Math.min(max, Math.max(min, next)))} style={({ pressed }) => [s.stepBtn, { borderColor: c.border }, pressed && { opacity: 0.6 }]}>
      <Text style={{ color: c.ink, fontSize: 20, fontWeight: '700' }}>{txt}</Text>
    </Pressable>
  );
  return (
    <View style={{ flex: 1 }}>
      <Label>{label}</Label>
      <View style={s.stepper}>
        {btn('−', value - 1, `Decrease ${label}`)}
        <Text style={[s.stepVal, { color: c.ink }]}>{value}{suffix}</Text>
        {btn('+', value + 1, `Increase ${label}`)}
      </View>
    </View>
  );
}

export function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { v: T; t: string }[]; value: T; onChange: (v: T) => void }) {
  const c = useColors();
  return (
    <View style={{ flex: 1 }}>
      <Label>{label}</Label>
      <View style={[s.seg, { backgroundColor: c.sunk }]}>
        {options.map((o) => {
          const on = o.v === value;
          return (
            <Pressable key={o.v} onPress={() => onChange(o.v)} accessibilityState={{ selected: on }} style={[s.segBtn, on && { backgroundColor: c.surface }]}>
              <Text style={{ color: on ? c.ink : c.muted, fontWeight: '600', fontSize: 13 }}>{o.t}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export interface TipOption { value: number; top: string; amount: string; sub?: string; recommended: boolean }

/**
 * Tip choices per the brand kit: default = surface + visible border; Selected = brand fill, check and
 * "Selected" label; Suggested = brass label. Suggested and Selected stay separate states.
 */
export function TipButtons({ options, selected, onSelect }: { options: TipOption[]; selected: number | null; onSelect: (v: number) => void }) {
  const c = useColors();
  return (
    <View style={s.tipRow}>
      {options.map((o) => {
        const on = o.value === selected;
        const fg = on ? c.accentInk : c.ink;
        const tag = on ? 'Selected' : o.recommended ? 'Suggested' : '';
        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${o.top}, ${o.amount}${o.recommended ? ', suggested' : ''}`}
            style={({ pressed }) => [
              s.tipBtn,
              { borderColor: on ? c.accent : o.recommended ? c.brass : c.border, backgroundColor: on ? c.accent : c.surface },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={s.tipTagRow}>
              <Text style={{ color: on ? c.accentInk : c.brassText, fontSize: 12, fontWeight: '600' }}>{tag}</Text>
              {on && <VerdictMark verdict="expected" color={c.accentInk} size={14} />}
            </View>
            <Text style={{ color: fg, fontFamily: mono, fontWeight: '700', fontSize: 22 }}>{o.top}</Text>
            <Text style={{ color: fg, fontFamily: mono, fontWeight: '500', fontSize: 15 }}>{o.amount}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ServiceRow({ s: svc, onPress, last }: { s: Service; onPress: () => void; last?: boolean }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, !last && { borderBottomWidth: 1, borderBottomColor: c.line }, pressed && { backgroundColor: c.sunk }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: c.ink, fontWeight: '600', fontSize: 15 }}>{svc.name}</Text>
        <Text style={{ color: c.muted, fontFamily: mono, fontSize: 12 }}>{normLabel(svc)}</Text>
      </View>
      <Pill verdict={svc.verdict} />
    </Pressable>
  );
}

/** Empty-state illustration from the brand kit: a soft green circle with the section's icon, plus one line. */
export function EmptyState({ icon, title, detail }: { icon: IconName; title: string; detail?: string }) {
  const c = useColors();
  return (
    <View style={s.empty}>
      <View style={[s.emptyCircle, { backgroundColor: c.yesBg }]}>
        <Icon name={icon} color={c.accent} size={44} />
      </View>
      <Text style={{ color: c.ink, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{title}</Text>
      {detail ? <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>{detail}</Text> : null}
    </View>
  );
}

/** Small "PRO" badge shown next to locked features. */
export function ProTag() {
  const c = useColors();
  return (
    <View style={[s.proTag, { borderColor: c.brass }]}>
      <Text style={{ color: c.brassText, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 }}>PRO</Text>
    </View>
  );
}

export function Chip({ label, onPress, onLongPress, active, locked, icon }: { label: string; onPress: () => void; onLongPress?: () => void; active?: boolean; locked?: boolean; icon?: IconName }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [s.chip, { borderColor: active ? c.ink : c.border, backgroundColor: active ? c.ink : 'transparent' }, pressed && { opacity: 0.7 }]}
    >
      {icon && <Icon name={icon} color={active ? c.bg : c.ink} size={16} />}
      <Text style={{ color: active ? c.bg : c.ink, fontWeight: '600', fontSize: 13 }}>{label}</Text>
      {locked && <ProTag />}
    </Pressable>
  );
}

export function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  const c = useColors();
  return (
    <Pressable onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label} hitSlop={8}
      style={[s.check, { borderColor: checked ? c.accent : c.border, backgroundColor: checked ? c.accent : 'transparent' }]}>
      {checked && <Text style={{ color: c.accentInk, fontWeight: '900', fontSize: 14 }}>✓</Text>}
    </Pressable>
  );
}

export function Bars({ rows, max }: { rows: [string, number][]; max: number }) {
  const c = useColors();
  const top = Math.max(...rows.map((r) => r[1]));
  return (
    <View style={{ gap: 7 }}>
      {rows.map(([k, v]) => (
        <View key={k} style={s.bar}>
          <Text style={{ color: c.muted, fontSize: 13, width: 100 }}>{k}</Text>
          <View style={[s.track, { backgroundColor: c.sunk }]}>
            <View style={{ width: `${Math.min(100, (v / max) * 100)}%`, height: '100%', borderRadius: 6, backgroundColor: v === top ? c.brass : c.accent }} />
          </View>
          <Text style={{ color: c.ink, fontFamily: mono, fontWeight: '700', fontSize: 13, width: 40, textAlign: 'right' }}>{v}%</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  h2: { fontFamily: 'display', fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  h3: { fontFamily: 'display', fontSize: 20, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'center' },
  pillLarge: { paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  pillText: { fontSize: 12, fontWeight: '700' },
  btn: { borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  money: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12 },
  moneyInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, fontFamily: font('mono', 700), fontSize: 19 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepVal: { fontFamily: mono, fontWeight: '700', fontSize: 18, minWidth: 34, textAlign: 'center' },
  seg: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 3 },
  segBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipBtn: { flexGrow: 1, flexBasis: 92, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, gap: 4, minHeight: 96 },
  tipTagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  proTag: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 20, paddingHorizontal: 16 },
  emptyCircle: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' },
  check: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
