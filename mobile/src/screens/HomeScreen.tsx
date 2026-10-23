import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Banner, Body, Button, Card, Heading } from '../components/ui';
import { APP_VERSION, GROUP_CODE } from '../config';
import { loadLastResult } from '../storage';
import { RootStackParamList, ResultView } from '../types';
import { useOnline } from '../useOnline';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const online = useOnline();
  const [last, setLast] = useState<ResultView | null>(null);
  useEffect(() => navigation.addListener('focus', () => { loadLastResult().then(setLast); }), [navigation]);
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Heading>AgriSoko Pocket {GROUP_CODE}</Heading>
      <Card>
        <Body>Ask about any team member by name, nickname, role, skill or feature and get an evidence-based profile. Built for potato cooperatives, employers and innovation partners in Musanze.</Body>
        <Body muted>Team code: {GROUP_CODE} · Version {APP_VERSION}</Body>
      </Card>
      {online ? <Banner text="Online: questions go to the AI service." /> :
        <Banner text="Offline: exact name, nickname and role lookup still works." />}
      <Button title="Ask the team" onPress={() => navigation.navigate('Ask')} />
      <Button secondary title="Member directory" onPress={() => navigation.navigate('Directory')} />
      <Button secondary title="About and evidence" onPress={() => navigation.navigate('About')} />
      {last && <Button secondary title={`Last result: ${last.result.member_name ?? 'no match'}`}
        onPress={() => navigation.navigate('Result', { view: { ...last, source: 'cached' } })} />}
    </ScrollView>
  );
}
