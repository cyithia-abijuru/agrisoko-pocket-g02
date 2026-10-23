import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text } from 'react-native';
import { fetchMembers } from '../api';
import { Banner, Body, Card, Heading, SourceBadge } from '../components/ui';
import { bundledMembers } from '../offline';
import { loadDirectory, saveDirectory } from '../storage';
import { colors } from '../theme';
import { DirectoryItem, RootStackParamList, Source } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Directory'>;

export default function DirectoryScreen({ navigation }: Props) {
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [source, setSource] = useState<Source>('offline');
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNote(null);
    try {
      const rows = await fetchMembers();
      setItems(rows); setSource('live'); await saveDirectory(rows);
    } catch {
      const cached = await loadDirectory();
      if (cached) { setItems(cached); setSource('cached'); }
      else { setItems(bundledMembers); setSource('offline'); }
      setNote('Server unreachable. Showing saved directory. Pull to retry.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={items}
      keyExtractor={(m) => m.id}
      refreshing={loading}
      onRefresh={load}
      ListHeaderComponent={
        <>
          <Heading>Member directory</Heading>
          {loading && items.length === 0 ? <ActivityIndicator color={colors.primary} /> : <SourceBadge source={source} />}
          {note && <Banner text={note} />}
        </>
      }
      ListEmptyComponent={!loading ? <Body>No members to show.</Body> : null}
      renderItem={({ item }) => (
        <Pressable accessibilityRole="button" accessibilityLabel={`Open profile of ${item.fullName}, ${item.role}`}
          onPress={() => navigation.navigate('Profile', { memberId: item.id, source })}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{item.fullName}</Text>
            <Body muted>{item.role}</Body>
            <Body muted>{item.skills.join(' · ')}</Body>
          </Card>
        </Pressable>
      )}
    />
  );
}
