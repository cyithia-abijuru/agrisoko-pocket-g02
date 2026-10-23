import bundled from '../assets/members.json';
import { GROUP_CODE } from './config';
import { AskResult, Member } from './types';

export const bundledMembers = bundled as unknown as Member[];

const norm = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Offline lookup: exact name / alias / role, whole-word match only.
 * Returns a grounded AskResult built from stored fields, or null.
 */
export function offlineLookup(question: string, members: Member[] = bundledMembers): AskResult | null {
  const q = ` ${norm(question)} `;
  const firsts = members.map((m) => norm(m.fullName).split(' ')[0]);
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const names = [m.fullName, ...m.aliases, m.role];
    if (firsts.filter((f) => f === firsts[i]).length === 1) names.push(firsts[i]);
    const hit = names.find((n) => norm(n).length >= 3 && q.includes(` ${norm(n)} `));
    if (hit) {
      return {
        query: question, matched: true, member_id: m.id, member_name: m.fullName,
        confidence: 1, reason: `offline exact match on '${hit}'`, matched_terms: [norm(hit)],
        introduction: m.introductionDraft, evidence_links: m.evidenceLinks ?? {},
        suggestions: [], model_version: 'offline-lookup', group_code: GROUP_CODE,
      };
    }
  }
  return null;
}
