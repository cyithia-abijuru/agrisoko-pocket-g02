import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { fetchMember } from '../api';
import { EvidenceLinks } from '../components/EvidenceLinks';
import { Banner, Body, Button, Card, Heading, SourceBadge } from '../components/ui';
import { bundledMembers } from '../offline';
import { colors } from '../theme';
import { Member, RootStackParamList, Source } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ route }: Props) {
  const { memberId } = route.params;
  const [m, setM] = useState<Member | null>(null);
  const [source, setSource] = useState<Source>('live');
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const load = async () => {
    setLoading(true); setMissing(false);
    try { setM(await fetchMember(memberId)); setSource('live'); }
    catch {
      const local = bundledMembers.find((x) => x.id === memberId) ?? null;
      setM(local); setSource('offline'); setMissing(!local);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [memberId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />;
  if (!m) return <ScrollView contentContainerStyle={{ padding: 16 }}><Banner tone="error" text="Profile not found." /><Button title="Retry" onPress={load} /></ScrollView>;
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <SourceBadge source={source} />
      <Heading>{m.fullName}</Heading>
      <Body muted>{m.role} · GitHub: {m.githubUsername}</Body>
      <Card><Body>{m.introductionDraft}</Body></Card>
      <Heading>Contribution</Heading>
      <Card><Body>{m.contribution}</Body><Body muted>Feature: {m.feature}</Body></Card>
      <Heading>Skills</Heading>
      <Card><Body>{m.skills.join(', ')}</Body></Card>
      <Heading>Measured evidence</Heading>
      <Card><Body>{m.outcomeMetric ?? 'No verified outcome metric recorded yet.'}</Body>
        {m.testerFeedback && <Body muted>Tester feedback: {m.testerFeedback}</Body>}</Card>
      <Heading>Links</Heading>
      <EvidenceLinks links={m.evidenceLinks} />
    </ScrollView>
  );
}
