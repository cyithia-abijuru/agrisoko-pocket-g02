# COMBO_A3_G02_REPORT.pdf: outline (max 10 pages, must match final APK and repo)

1. **Problem and users:** scenario, target users, product promise, members and roles.
2. **Information architecture:** screens Home → Ask → Result → Profile; Directory → Profile; About. Online/offline flow: validate → NetInfo → POST /ask; on failure → bundled exact name/alias/role lookup → else no-match + directory.
3-4. **Annotated interface:** screenshots of Home, Ask, Result, Directory, Profile, no-match, error, offline states (take from your real phone).
5. **AI design:** member schema, searchable fields, word+char TF-IDF, cosine, exact-name boost (0.95), threshold (0.20, tuned from 0.45; include your sweep table), grounding controls.
6. **API and integration:** endpoint contract with real request/response examples, 8 s timeout, retry, cache labels (live / cached / offline).
7. **Testing evidence:** `docs/AI_EVAL.md`, pytest output, device matrix, tester findings, fixed issues.
8. **GitHub collaboration:** issues, branches, PRs, reviews, v1.0.0 tag, contribution map.
9-10. **Results and responsible AI:** final screenshots, limitations, privacy, truthful claims, AI use, lessons, next steps.
