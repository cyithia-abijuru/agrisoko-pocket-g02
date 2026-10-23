# GitHub plan (one issue per assessed feature)

Create repo `agrisoko-pocket-G02`, invite all members, then:

| Issue | Owner role | Branch | Module label |
|---|---|---|---|
| members.json schema + validation | AI/data | feature/members-data | ai-api |
| TF-IDF index, threshold, evaluation | AI/data | feature/tfidf-engine | ai-api |
| FastAPI endpoints + Pydantic | API | feature/api-endpoints | ai-api |
| Deployment + logging | API | feature/deploy | ai-api |
| Screens + typed navigation + accessibility | Mobile | feature/mobile-ui | mobile |
| Offline lookup + cache + NetInfo | Offline | feature/offline-cache | mobile |
| APK via EAS + release v1.0.0 | Release | feature/release | release |
| Report, test log, submission audit | Evidence | feature/docs | docs |

Each member: ≥1 substantial PR linked to their issue (`Closes #n`) and ≥1 meaningful review of someone else's PR. Do not commit for other people or share accounts. Tag `v1.0.0` on main and attach the APK to a GitHub Release.
