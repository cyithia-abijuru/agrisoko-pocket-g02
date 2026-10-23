import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme';
import { Source } from '../types';

export function Button({ title, onPress, disabled, secondary, label }: {
  title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.btn, secondary && s.btnSecondary, disabled && { opacity: 0.5 }]}
    >
      <Text style={[s.btnText, secondary && { color: colors.primary }]}>{title}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Heading({ children }: { children: React.ReactNode }) {
  return <Text accessibilityRole="header" style={s.h}>{children}</Text>;
}

export function Body({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <Text style={[s.body, muted && { color: colors.muted }]}>{children}</Text>;
}

const SOURCE_TEXT: Record<Source, string> = {
  live: 'LIVE result from server',
  cached: 'CACHED result (last successful)',
  offline: 'OFFLINE match (bundled data)',
};

export function SourceBadge({ source }: { source: Source }) {
  const c = colors[source];
  return (
    <View accessibilityLabel={SOURCE_TEXT[source]} style={[s.badge, { borderColor: c }]}>
      <Text style={{ color: c, fontWeight: '700' }}>{SOURCE_TEXT[source]}</Text>
    </View>
  );
}

export function Banner({ text, tone = 'warn' }: { text: string; tone?: 'warn' | 'error' }) {
  return (
    <View accessibilityLiveRegion="polite" style={[s.banner, tone === 'error' && { borderColor: colors.error }]}>
      <Text style={{ color: tone === 'error' ? colors.error : colors.warn, fontSize: 16 }}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  btn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 10, minHeight: 48, justifyContent: 'center', alignItems: 'center', marginVertical: 6 },
  btnSecondary: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.primary },
  btnText: { color: colors.onPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginVertical: 8, borderWidth: 1, borderColor: colors.border },
  h: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 6 },
  body: { fontSize: 16, color: colors.text, lineHeight: 23 },
  badge: { alignSelf: 'flex-start', borderWidth: 2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  banner: { backgroundColor: colors.warnBg, borderWidth: 1, borderColor: colors.warn, borderRadius: 8, padding: 12, marginVertical: 8 },
});
