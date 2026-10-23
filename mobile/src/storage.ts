import AsyncStorage from '@react-native-async-storage/async-storage';
import { DirectoryItem, ResultView } from './types';

const KEY_DIR = 'directory.v1';
const KEY_LAST = 'lastResult.v1';

export async function saveDirectory(m: DirectoryItem[]) {
  try { await AsyncStorage.setItem(KEY_DIR, JSON.stringify(m)); } catch {}
}
export async function loadDirectory(): Promise<DirectoryItem[] | null> {
  try {
    const s = await AsyncStorage.getItem(KEY_DIR);
    return s ? (JSON.parse(s) as DirectoryItem[]) : null;
  } catch { return null; }
}
export async function saveLastResult(v: ResultView) {
  try { await AsyncStorage.setItem(KEY_LAST, JSON.stringify(v)); } catch {}
}
export async function loadLastResult(): Promise<ResultView | null> {
  try {
    const s = await AsyncStorage.getItem(KEY_LAST);
    return s ? (JSON.parse(s) as ResultView) : null;
  } catch { return null; }
}
