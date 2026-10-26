import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { useColors } from '../theme';

/**
 * iPhone only: a Done bar that sits on top of the keyboard, because the number pad has no Done or
 * Return key. React Native's InputAccessoryView is deprecated, so this follows the keyboard's own
 * show and hide events instead. Render one inside each screen root and each Modal (a Modal is a
 * separate window, so a bar outside it would sit behind it).
 */
export function DoneBar() {
  const c = useColors();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const subs = [
      Keyboard.addListener('keyboardWillShow', (e) => setHeight(e.endCoordinates.height)),
      Keyboard.addListener('keyboardWillChangeFrame', (e) => setHeight((h) => (h > 0 ? e.endCoordinates.height : h))),
      Keyboard.addListener('keyboardWillHide', () => setHeight(0)),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  if (Platform.OS !== 'ios' || height <= 0) return null;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[st.bar, { bottom: height, backgroundColor: c.sunk, borderTopColor: c.line }]}>
        <Pressable onPress={() => Keyboard.dismiss()} accessibilityRole="button" accessibilityLabel="Done, close the keyboard" hitSlop={8} style={st.done}>
          <Text style={{ color: c.accent, fontWeight: '600', fontSize: 17 }}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Scroll views close the keyboard when dragged: iPhone follows the finger, Android closes on drag. */
export const dismissOnDrag = Platform.OS === 'ios' ? ('interactive' as const) : ('on-drag' as const);

const st = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, height: 44, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16 },
  done: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
});
