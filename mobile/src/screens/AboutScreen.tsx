import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { fetchHealth, fetchModelInfo } from '../api';
import { openLink } from '../components/openLink';
import { Banner, Body, Button, Card, Heading } from '../components/ui';
import { API_BASE_URL, APP_VERSION, GITHUB_URL, GROUP_CODE, VERIFICATION_CODE } from '../config';

export default function AboutScreen() {
  const [api, setApi] = useState('checking...');
  const [info, setInfo] = useState<Record<string, unknown> | null>(null);
  const check = async () => {
    setApi('checking...');
    try { const h = await fetchHealth(); setApi(`${h.status} (v${h.version})`); setInfo(await fetchModelInfo()); }
    catch { setApi('unavailable'); }
  };
  useEffect(() => { check(); }, []);
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Heading>About and evidence</Heading>
      <Card>
        <Body>Group code: {GROUP_CODE}</Body>
        <Body>APK version: {APP_VERSION}</Body>
        <Body>Verification code: {VERIFICATION_CODE}</Body>
        <Body>API: {API_BASE_URL}</Body>
        <Body>API status: {api}</Body>
      </Card>
      <Card>
        <Body>Data source: approved members.json reviewed by each member.</Body>
        <Body>Model: deterministic TF-IDF (word + character) with cosine similarity, exact name/alias boost and a confidence threshold. No generative AI.</Body>
        {info && <Body muted>Threshold {String(info.threshold)} · fingerprint {String(info.dataset_fingerprint_sha256).slice(0, 12)}… · commit {String(info.build_commit)}</Body>}
      </Card>
      <Banner text="Limitations: lexical matching only; paraphrases without shared words may fail. Offline mode supports exact names, nicknames and roles only." />
      <Button secondary title="Refresh API status" onPress={check} />
      {!!GITHUB_URL && <Button title="Open GitHub repository" onPress={() => openLink(GITHUB_URL)} />}
    </ScrollView>
  );
}
