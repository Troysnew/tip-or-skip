import React from 'react';
import { StyleSheet, Text as RNText, type TextProps } from 'react-native';
import { font, weightOf, type FontKind } from '../fonts';

/**
 * Drop-in replacement for React Native's Text that applies the brand fonts.
 * Set fontFamily to 'display' or 'mono' to switch families; anything else uses Inter.
 * The fontWeight in the style picks the matching font file.
 */
export function Text(props: TextProps) {
  const flat = StyleSheet.flatten(props.style) ?? {};
  const fam = flat.fontFamily;
  const kind: FontKind = fam === 'display' || fam === 'mono' ? fam : 'body';
  return <RNText {...props} style={[props.style, { fontFamily: font(kind, weightOf(flat.fontWeight)), fontWeight: 'normal' }]} />;
}
