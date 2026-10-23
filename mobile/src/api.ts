import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import { AskResult, DirectoryItem, Member } from './types';

const http = axios.create({ baseURL: API_BASE_URL, timeout: API_TIMEOUT_MS });

export type ApiErrorKind = 'timeout' | 'server' | 'network' | 'client';

export class ApiError extends Error {
  constructor(public kind: ApiErrorKind, message: string) {
    super(message);
  }
}

function toApiError(e: unknown): ApiError {
  const err = e as AxiosError;
  if (err.code === 'ECONNABORTED') return new ApiError('timeout', 'The server took too long to answer.');
  if (err.response) {
    const s = err.response.status;
    return s >= 500
      ? new ApiError('server', 'The server is unavailable right now.')
      : new ApiError('client', `The request was rejected (${s}).`);
  }
  return new ApiError('network', 'Could not reach the server.');
}

export async function askApi(question: string): Promise<AskResult> {
  try {
    return (await http.post<AskResult>('/ask', { question })).data;
  } catch (e) {
    throw toApiError(e);
  }
}

export async function fetchMembers(): Promise<DirectoryItem[]> {
  try {
    const rows = (await http.get<DirectoryItem[]>('/members')).data;
    return rows;
  } catch (e) {
    throw toApiError(e);
  }
}

export async function fetchMember(id: string): Promise<Member> {
  try {
    return (await http.get<Member>(`/members/${id}`)).data;
  } catch (e) {
    throw toApiError(e);
  }
}

export async function fetchHealth() {
  try {
    return (await http.get<{ status: string; version: string; group_code: string }>('/health')).data;
  } catch (e) {
    throw toApiError(e);
  }
}

export async function fetchModelInfo() {
  try {
    return (await http.get<Record<string, unknown>>('/model-info')).data;
  } catch (e) {
    throw toApiError(e);
  }
}
