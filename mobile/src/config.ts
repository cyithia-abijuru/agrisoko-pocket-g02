import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const API_BASE_URL = extra.apiBaseUrl ?? 'http://10.0.2.2:8000';
export const API_TIMEOUT_MS = 8000;
export const MAX_QUESTION_LENGTH = 300;
export const GROUP_CODE = extra.groupCode ?? 'G02';
export const GITHUB_URL = extra.githubUrl ?? '';
export const VERIFICATION_CODE = extra.verificationCode ?? '';
export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
