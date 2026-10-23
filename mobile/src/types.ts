export type Source = 'live' | 'cached' | 'offline';

export interface Member {
  id: string;
  fullName: string;
  registrationNumber: string;
  aliases: string[];
  githubUsername: string;
  role: string;
  skills: string[];
  targetUser: string;
  problem: string;
  contribution: string;
  feature: string;
  outcomeMetric: string | null;
  evidenceLinks: Record<string, string>;
  testerFeedback: string | null;
  introductionDraft: string;
}

export interface AskResult {
  query: string;
  matched: boolean;
  member_id: string | null;
  member_name: string | null;
  confidence: number;
  reason: string;
  matched_terms: string[];
  introduction: string | null;
  evidence_links: Record<string, string>;
  suggestions: string[];
  model_version: string;
  group_code: string;
}

export interface ResultView {
  result: AskResult;
  source: Source;
  savedAt: number;
}

export type RootStackParamList = {
  Home: undefined;
  Ask: undefined;
  Result: { view: ResultView };
  Directory: undefined;
  Profile: { memberId: string; source?: Source };
  About: undefined;
};

export type DirectoryItem = Pick<Member, 'id' | 'fullName' | 'aliases' | 'role' | 'skills' | 'feature'>;
