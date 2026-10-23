import { Alert, Linking } from 'react-native';

export async function openLink(url: string) {
  try {
    if (!/^https?:\/\//i.test(url) || !(await Linking.canOpenURL(url))) throw new Error('bad url');
    await Linking.openURL(url);
  } catch {
    Alert.alert('Link unavailable', 'This link could not be opened. It may be missing or you may be offline.');
  }
}
