import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView } from 'react-native';
import { EvidenceLinks } from '../components/EvidenceLinks';
import { Banner, Body, Button, Card, Heading, SourceBadge } from '../components/ui';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { result: r, source } = route.params.view;
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <SourceBadge source={source} />
      {r.matched ? (
        <>
          <Heading>{r.member_name}</Heading>
          <Card>
            <Body>Confidence: {(r.confidence * 100).toFixed(0)}%</Body>
            <Body muted>Why: {r.reason}</Body>
          </Card>
          <Card><Body>{r.introduction}</Body></Card>
          <Heading>Evidence</Heading>
          <EvidenceLinks links={r.evidence_links} />
          <Button title="Open full profile" onPress={() => navigation.navigate('Profile', { memberId: r.member_id!, source })} />
          <Body muted>Model: {r.model_version} · Group {r.group_code}</Body>
        </>
      ) : (
        <>
          <Heading>No confident match</Heading>
          <Banner text={`${r.reason} (best confidence ${(r.confidence * 100).toFixed(0)}%)`} />
          {r.suggestions.length > 0 && <Card><Body>Try one of: {r.suggestions.join(', ')}</Body></Card>}
          <Button title="Browse directory" onPress={() => navigation.navigate('Directory')} />
        </>
      )}
      <Button secondary title="Ask another question" onPress={() => navigation.navigate('Ask')} />
    </ScrollView>
  );
}
