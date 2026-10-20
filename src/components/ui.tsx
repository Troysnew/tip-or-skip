import React from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { VERDICT_TEXT, type Service, type Verdict } from '../data/services';
import { font } from '../fonts';
import { normLabel } from '../lib/tip';
import { mono, space, useColors, verdictColors } from '../theme';
import { CATEGORY_ICON, Icon, type IconName } from './icons';
import { Text } from './Text';

// Shared components, styled to the Modern Mint handoff (design/modern-mint/DEVELOPER-HANDOFF.md).

export function Card({ children, style, outlined }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; outlined?: boolean }) {
  const c = useColors();
  return <View style={[s.card, { backgroundColor: c.surface, borderColor: outlined ? c.border : c.line }, style]}>{children}</View>;
}

/** Screen title: Inter ExtraBold 28/34. */
export function H2({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text accessibilityRole="header" style={[s.h2, { color: c.ink }]}>{children}</Text>;
}

/** Section title. */
export function H3({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text accessibilityRole="header" style={[s.h3, { color: c.ink }]}>{children}</Text>;
}

export function Body({ children, muted, small }: { children: React.ReactNode; muted?: boolean; small?: boolean }) {
  const c = useColors();
  return <Text style={{ color: muted ? c.muted : c.ink, fontSize: small ? 14 : 16, lineHeight: small ? 20 : 24 }}>{children}</Text>;
}

/** Field label: Inter SemiBold 14/20. */
export function Label({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[s.label, { color: c.muted }]}>{children}</Text>;
}

/** Verdict pill: dot plus the verdict word, never color alone. */
export function Pill({ verdict, long, large }: { verdict: Verdict; long?: boolean; large?: boolean }) {
  const c = useColors();
  const vc = verdictColors(c, verdict);
  const word = long ? VERDICT_TEXT[verdict].answer : VERDICT_TEXT[verdict].short;
  return (
    <View style={[s.pill, large && s.pillLarge, { backgroundColor: vc.bg }]} accessibilityLabel={`Verdict: ${word}`}>
      <View style={[s.dot, { backgroundColor: vc.fg }]} />
      <Text style={{ color: vc.fg, fontSize: large ? 15 : 12, fontWeight: '600' }}>{word}</Text>
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
        small && { minHeight: 44, paddingVertical: 8, paddingHorizontal: 12 },
        ghost ? { borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface } : { backgroundColor: c.accent },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={{ color: ghost ? c.ink : c.accentInk, fontWeight: '600', fontSize: small ? 14 : 16 }}>{title}</Text>
    </Pressable>
  );
}

export function MoneyField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Label>{label}</Label>
      <View style={[s.money, { borderColor: c.border, backgroundColor: c.surface }]}>
        <Text style={{ color: c.muted, fontFamily: mono, fontSize: 18 }}>$</Text>
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

/** The large bill field at the top of the calculator: label plus a 48-unit amount. */
export function BigMoneyField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const c = useColors();
  return (
    <View style={[s.bigMoney, { borderColor: c.border, backgroundColor: c.surface }]}>
      <Label>{label}</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: value ? c.ink : c.muted, fontFamily: mono, fontSize: 44, lineHeight: 56 }}>$</Text>
        <TextInput
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={c.muted}
          style={[s.bigInput, { color: c.ink }]}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

/** Pill stepper: minus, value, plus. Each button is a 48 × 48 target. */
export function Stepper({ label, value, onChange, min = 1, max = 99, suffix = '', inline }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string; inline?: boolean }) {
  const c = useColors();
  const btn = (icon: IconName, next: number, a11y: string, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      disabled={disabled}
      onPress={() => onChange(Math.min(max, Math.max(min, next)))}
      style={({ pressed }) => [s.stepBtn, { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} color={c.ink} size={22} />
    </Pressable>
  );
  const control = (
    <View style={[s.stepper, { backgroundColor: c.sunk }]}>
      {btn('minus', value - 1, `Decrease ${label}`, value <= min)}
      <Text style={[s.stepVal, { color: c.ink }]} accessibilityLabel={`${label}: ${value}${suffix}`}>{value}{suffix}</Text>
      {btn('plus', value + 1, `Increase ${label}`, value >= max)}
    </View>
  );
  if (inline) {
    return (
      <View style={s.inlineRow}>
        <Text style={{ color: c.ink, fontSize: 16, fontWeight: '600', flex: 1 }}>{label}</Text>
        {control}
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <Label>{label}</Label>
      {control}
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
            <Pressable key={o.v} onPress={() => onChange(o.v)} accessibilityRole="button" accessibilityState={{ selected: on }} style={[s.segBtn, on && { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1 }]}>
              <Text style={{ color: on ? c.ink : c.muted, fontWeight: '600', fontSize: 14 }}>{o.t}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export interface TipOption { value: number; top: string; amount: string; sub?: string; recommended: boolean }

/**
 * Tip choice cards. Default shows a "Tip" label; Selected = filled card, check and "Selected" label;
 * Suggested = its own yellow pill and never selects anything by itself.
 */
export function TipButtons({ options, selected, onSelect }: { options: TipOption[]; selected: number | null; onSelect: (v: number) => void }) {
  const c = useColors();
  return (
    <View style={s.tipRow}>
      {options.map((o) => {
        const on = o.value === selected;
        const fg = on ? c.onSelected : c.ink;
        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${o.top}, ${o.amount}${o.recommended ? ', suggested' : ''}`}
            style={({ pressed }) => [
              s.tipBtn,
              { borderColor: on ? c.selected : c.border, backgroundColor: on ? c.selected : c.surface },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={s.tipTagRow}>
              {on ? (
                <>
                  <Text style={{ color: fg, fontSize: 13, fontWeight: '600' }}>Selected</Text>
                  <Icon name="check" color={fg} size={16} />
                </>
              ) : o.recommended ? (
                <View style={[s.suggested, { backgroundColor: c.suggestedBg }]}>
                  <Text style={{ color: c.suggestedText, fontSize: 12, fontWeight: '600' }}>Suggested</Text>
                </View>
              ) : (
                <Text style={{ color: c.muted, fontSize: 13, fontWeight: '600' }}>Tip</Text>
              )}
            </View>
            <Text style={{ color: fg, fontFamily: mono, fontSize: 26, lineHeight: 32 }}>{o.top}</Text>
            <Text style={{ color: fg, fontFamily: mono, fontSize: 17, lineHeight: 22 }}>{o.amount}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Secondary full-width choice such as "Custom tip" or "No tip". */
export function OptionButton({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={({ pressed }) => [s.option, { borderColor: on ? c.selected : c.border, backgroundColor: on ? c.selected : c.surface }, pressed && { opacity: 0.85 }]}
    >
      {on && <Icon name="check" color={c.onSelected} size={16} />}
      <Text style={{ color: on ? c.onSelected : c.ink, fontSize: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

/** Service entry. "card" = Tipping guide card with category icon; "row" = compact list row for search suggestions. */
export function ServiceRow({ s: svc, onPress, last, variant = 'row' }: { s: Service; onPress: () => void; last?: boolean; variant?: 'row' | 'card' }) {
  const c = useColors();
  const icon: IconName = svc.id === 'coffee' ? 'coffee' : CATEGORY_ICON[svc.category];
  if (variant === 'card') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${svc.name}, ${VERDICT_TEXT[svc.verdict].answer}, ${normLabel(svc)}`}
        style={({ pressed }) => [s.serviceCard, { backgroundColor: c.surface, borderColor: c.line }, pressed && { backgroundColor: c.sunk }]}
      >
        <Icon name={icon} color={c.accent} size={26} />
        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          <View style={{ gap: 2 }}>
            <Text style={{ color: c.ink, fontWeight: '600', fontSize: 17 }}>{svc.name}</Text>
            <Text style={{ color: c.muted, fontSize: 14 }}>{normLabel(svc)}</Text>
          </View>
          <View style={{ alignSelf: 'flex-start' }}><Pill verdict={svc.verdict} large /></View>
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.row, !last && { borderBottomWidth: 1, borderBottomColor: c.line }, pressed && { backgroundColor: c.sunk }]}>
      <Icon name={icon} color={c.accent} size={22} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: c.ink, fontWeight: '600', fontSize: 15 }}>{svc.name}</Text>
        <Text style={{ color: c.muted, fontSize: 13 }}>{normLabel(svc)}</Text>
      </View>
      <Pill verdict={svc.verdict} />
    </Pressable>
  );
}

/** Empty state from the kit: soft circle with the section icon, plus one line. */
export function EmptyState({ icon, title, detail }: { icon: IconName; title: string; detail?: string }) {
  const c = useColors();
  return (
    <View style={s.empty}>
      <View style={[s.emptyCircle, { backgroundColor: c.sunk }]}>
        <Icon name={icon} color={c.accent} size={44} />
      </View>
      <Text style={{ color: c.muted, fontSize: 17, fontWeight: '600', textAlign: 'center' }}>{title}</Text>
      {detail ? <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>{detail}</Text> : null}
    </View>
  );
}

/** "PRO" capsule: accent outline and text. */
export function ProTag() {
  const c = useColors();
  return (
    <View style={[s.proTag, { borderColor: c.accent }]}>
      <Text style={{ color: c.accent, fontSize: 11, fontWeight: '600', letterSpacing: 0.4 }}>PRO</Text>
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
      style={({ pressed }) => [s.chip, { borderColor: active ? c.selected : c.border, backgroundColor: active ? c.selected : c.surface }, pressed && { opacity: 0.75 }]}
    >
      {icon && <Icon name={icon} color={active ? c.onSelected : c.ink} size={16} />}
      <Text style={{ color: active ? c.onSelected : c.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      {locked && <ProTag />}
    </Pressable>
  );
}

export function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  const c = useColors();
  return (
    <Pressable onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label} hitSlop={11}
      style={[s.check, { borderColor: checked ? c.selected : c.border, backgroundColor: checked ? c.selected : 'transparent' }]}>
      {checked && <Icon name="check" color={c.onSelected} size={16} />}
    </Pressable>
  );
}

export function Bars({ rows, max }: { rows: [string, number][]; max: number }) {
  const c = useColors();
  const top = Math.max(...rows.map((r) => r[1]));
  return (
    <View style={{ gap: 8 }}>
      {rows.map(([k, v]) => (
        <View key={k} style={s.bar}>
          <Text style={{ color: c.muted, fontSize: 13, width: 100 }}>{k}</Text>
          <View style={[s.track, { backgroundColor: c.sunk }]}>
            <View style={{ width: `${Math.min(100, (v / max) * 100)}%`, height: '100%', borderRadius: 6, backgroundColor: v === top ? c.selected : c.accent }} />
          </View>
          <Text style={{ color: c.ink, fontFamily: mono, fontSize: 13, width: 40, textAlign: 'right' }}>{v}%</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: space.cardRadius, padding: 16, gap: 12 },
  h2: { fontFamily: 'display', fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  h3: { fontFamily: 'display', fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600', marginBottom: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'center' },
  pillLarge: { paddingHorizontal: 14, paddingVertical: 7, gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  btn: { minHeight: space.target, borderRadius: space.controlRadius, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  money: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: space.controlRadius, paddingHorizontal: 12, minHeight: space.target },
  moneyInput: { flex: 1, alignSelf: 'stretch', paddingVertical: 0, paddingHorizontal: 6, fontFamily: font('mono'), fontSize: 18, fontVariant: ['tabular-nums'] },
  bigMoney: { borderWidth: 1.5, borderRadius: space.cardRadius, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10 },
  bigInput: { flex: 1, minHeight: 56, fontFamily: font('mono'), fontSize: 44, paddingVertical: 0, paddingHorizontal: 4, fontVariant: ['tabular-nums'] },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: space.controlRadius, alignSelf: 'flex-start' },
  stepBtn: { width: space.target, height: space.target, alignItems: 'center', justifyContent: 'center' },
  stepVal: { fontFamily: mono, fontSize: 20, minWidth: 40, textAlign: 'center' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  seg: { flexDirection: 'row', borderRadius: space.controlRadius, padding: 3, gap: 3 },
  segBtn: { flex: 1, minHeight: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tipBtn: { flexGrow: 1, flexBasis: 96, borderWidth: 1.5, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 12, gap: 4, minHeight: 112 },
  tipTagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 22 },
  suggested: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, flexGrow: 1, alignItems: 'center' },
  option: { flex: 1, minHeight: 52, borderWidth: 1.5, borderRadius: 16, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  serviceCard: { flexDirection: 'row', gap: 14, borderWidth: 1, borderRadius: space.cardRadius, paddingVertical: 18, paddingHorizontal: 18, alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, minHeight: 56 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 20, paddingHorizontal: 16 },
  emptyCircle: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' },
  proTag: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 14, minHeight: 44 },
  check: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
});
