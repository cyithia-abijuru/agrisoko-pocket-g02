import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { ApiError, askApi } from '../api';
import { Banner, Body, Button, Heading } from '../components/ui';
import { MAX_QUESTION_LENGTH } from '../config';
import { offlineLookup } from '../offline';
import { loadLastResult, saveLastResult } from '../storage';
import { bundledMembers } from '../offline';
import { colors } from '../theme';
import { Member, ResultView, RootStackParamList } from '../types';
import { useOnline } from '../useOnline';

type Props = NativeStackScreenProps<RootStackParamList, 'Ask'>;

export default function AskScreen({ navigation }: Props) {
  const online = useOnline();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const [lastGood, setLastGood] = useState<ResultView | null>(null);

  const submit = async () => {
    const text = q.trim();
    setError(null);
    if (!text) return setValidation('Please type a question.');
    if (text.length > MAX_QUESTION_LENGTH) return setValidation(`Question is too long (max ${MAX_QUESTION_LENGTH} characters).`);
    setValidation(null);
    setLoading(true);
    try {
      if (!online) throw new ApiError('network', 'You are offline.');
      const result = await askApi(text);
      const view: ResultView = { result, source: 'live', savedAt: Date.now() };
      await saveLastResult(view);
      setLastGood(view);
      navigation.navigate('Result', { view });
    } catch (e) {
      const err = e as ApiError;
      const local = offlineLookup(text, bundledMembers as Member[]);
      if (local) {
        const view: ResultView = { result: local, source: 'offline', savedAt: Date.now() };
        await saveLastResult(view);
        setLastGood(view);
        navigation.navigate('Result', { view });
      } else {
        const prev = lastGood ?? (await loadLastResult());
        if (prev) setLastGood(prev);
        const why = err.kind === 'timeout' ? 'The server timed out.'
          : err.kind === 'server' ? 'The server is unavailable.'
          : 'You appear to be offline.';
        setError(`${why} Offline lookup only supports exact names, nicknames and roles. Try again or use the directory.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Heading>Ask the team</Heading>
      <Body muted>Try: "Who built offline mode?" or "Tell me about Member One".</Body>
      <TextInput
        accessibilityLabel="Your question about the team"
        style={styles.input}
        value={q}
        onChangeText={setQ}
        placeholder="Type your question"
        placeholderTextColor="#5E6B5E"
        multiline
        maxLength={MAX_QUESTION_LENGTH + 50}
      />
      <Text style={{ color: colors.muted }}>{q.length}/{MAX_QUESTION_LENGTH}</Text>
      {validation && <Banner tone="error" text={validation} />}
      {loading ? <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading" /> :
        <Button title="Ask" onPress={submit} />}
      {error && (
        <>
          <Banner tone="error" text={error} />
          <Button title="Retry" onPress={submit} />
          <Button secondary title="Browse directory" onPress={() => navigation.navigate('Directory')} />
        </>
      )}
      {lastGood && error && (
        <Button secondary title={`Show last result: ${lastGood.result.member_name ?? 'no match'}`}
          onPress={() => navigation.navigate('Result', { view: { ...lastGood, source: 'cached' } })} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 17, minHeight: 90, marginVertical: 10, color: colors.text, textAlignVertical: 'top' },
});
