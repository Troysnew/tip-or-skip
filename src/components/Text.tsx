import React from 'react';
import { StyleSheet, Text as RNText, type TextProps } from 'react-native';
import { font, weightOf, type FontKind } from '../fonts';

/**
 * Drop-in replacement for React Native's Text that applies the Modern Mint fonts.
 * Set fontFamily to 'display', 'logo' or 'mono' to pick a role; anything else is Inter body text,
 * where fontWeight 500+ selects the SemiBold file. 'mono' is the amount style and uses tabular figures.
 */
export function Text(props: TextProps) {
  const flat = StyleSheet.flatten(props.style) ?? {};
  const fam = flat.fontFamily;
  const kind: FontKind = fam === 'display' || fam === 'mono' || fam === 'logo' ? fam : 'body';
  return (
    <RNText
      {...props}
      style={[
        props.style,
        { fontFamily: font(kind, weightOf(flat.fontWeight)), fontWeight: 'normal' },
        kind === 'mono' && { fontVariant: ['tabular-nums'] },
      ]}
    />
  );
}
