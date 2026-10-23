# AgriSoko Pocket G02

> Replace every `G02`, `REPLACE` and placeholder with your real group code, names and links before submission.

**Group code:** G02 · **App:** AgriSoko Pocket G02 · **Repository:** agrisoko-pocket-G02 · **APK:** AgriSokoPocket_G02.apk

## Purpose
A visitor asks a natural question ("Who built offline mode?", "Tell me about Aline") and gets the best-matching team member with a confidence score, the reason for the match and an evidence-based introduction built only from approved facts in `ai-api/data/members.json`.

## Members and roles
| # | Name | Reg. no. | GitHub | Primary role | Review role |
|---|------|----------|--------|--------------|-------------|
| 1 | REPLACE | REPLACE | REPLACE | Product and GitHub lead | |
| 2 | REPLACE | REPLACE | REPLACE | AI and data engineer | |
| 3 | REPLACE | REPLACE | REPLACE | API and integration engineer | |
| 4 | REPLACE | REPLACE | REPLACE | Mobile, offline and release | |

## Architecture
```
Android APK (Expo / React Native / TypeScript)
  ├─ online  ──► FastAPI (ai-api/app/main.py) ──► TF-IDF engine (app/engine.py) ──► members.json
  └─ offline ──► bundled assets/members.json: exact name / alias / role lookup (labelled "OFFLINE")
```
- **Matching:** one document per member; word (1-2) + char_wb (3-5) TF-IDF; mean cosine similarity; exact name/alias boost to 0.95 (single-token names shorter than 3 chars ignored; a first name counts only when unique); confidence threshold **0.20** (started at 0.45, lowered after a recorded-query sweep, see `docs/AI_EVAL.md`, re-run the sweep on your final data).
- **Grounding:** responses contain only fields from `members.json`; introductions rearrange stored facts; a metric appears only if `outcomeMetric` is set.
- **Fingerprint:** SHA-256 of `members.json` is served at `/model-info` and written by `build_index.py`.

## Setup and run: AI API
```bash
cd ai-api
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python build_index.py                  # validate data, build index, write build/model_meta.json
python -m pytest -q                    # automated tests
python evaluate.py --sweep             # threshold sweep
python evaluate.py --out ../docs/AI_EVAL.md
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Endpoints: `GET /health`, `GET /members`, `GET /members/{id}`, `POST /ask`, `GET /model-info`.
Deploy with the included `Dockerfile` (e.g. Render, Railway, Fly.io). Set `BUILD_COMMIT` to the final commit hash. No secrets are needed.

## Setup and run: mobile
```bash
cd mobile
npm install
npx expo install --fix                 # align Expo package versions with your SDK
# edit app.json -> expo.extra.apiBaseUrl, githubUrl, verificationCode
npm run typecheck
npx expo start
```
**API URL configuration:** `mobile/app.json` → `expo.extra.apiBaseUrl`. For an Android emulator talking to a local API use `http://10.0.2.2:8000`.

**EAS build command (installable APK, no Expo Go):**
```bash
npm i -g eas-cli && eas login
eas build -p android --profile preview      # produces .apk; download and rename to AgriSokoPocket_G02.apk
```
Place the APK in `build/AgriSokoPocket_G02.apk` and attach it to the GitHub Release `v1.0.0`.

## Tested devices
REPLACE (device, Android version) · REPLACE (second device/configuration)

## Release info
- Repository URL: REPLACE
- v1.0.0 release URL: REPLACE
- Final commit hash: REPLACE
- APK path: `build/AgriSokoPocket_G02.apk`

## Known limitations
- Lexical matching: paraphrases without shared words can fail.
- Confidence is cosine similarity, not a probability.
- Offline mode supports exact name, alias and role only.
- Evidence links are not re-verified at runtime.

## Where the evidence is
| Evidence | Location |
|---|---|
| Report | `docs/COMBO_A3_G02_REPORT.pdf` (outline in `docs/REPORT_OUTLINE.md`) |
| AI evaluation | `docs/AI_EVAL.md` |
| Demo video | `evidence/COMBO_A3_G02_DEMO.mp4` |
| Contributions (signed) | `evidence/CONTRIBUTIONS.pdf` |
| Test log | `evidence/TEST_LOG.pdf` |
| Tester feedback | `evidence/FEEDBACK.pdf` |
| AI use declaration | `evidence/AI_USE.md` |
