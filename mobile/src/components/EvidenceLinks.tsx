import React from 'react';
import { Text, View } from 'react-native';
import { Button, Body } from './ui';
import { openLink } from './openLink';

export function EvidenceLinks({ links }: { links: Record<string, string> }) {
  const entries = Object.entries(links ?? {});
  if (!entries.length) return <Body muted>No evidence links stored.</Body>;
  return (
    <View>
      {entries.map(([k, v]) =>
        /^https?:\/\//i.test(v) ? (
          <Button key={k} secondary title={`Open ${k}`} onPress={() => openLink(v)} label={`Open ${k} link`} />
        ) : (
          <Text key={k} style={{ fontSize: 15, marginVertical: 4 }}>{k}: {v}</Text>
        ),
      )}
    </View>
  );
}
