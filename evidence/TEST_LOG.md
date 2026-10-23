# Test log (export to TEST_LOG.pdf): REPLACE every row with REAL results

## AI query tests (3 per member + 5 no-match) — run `python evaluate.py --out ../docs/AI_EVAL.md`
Attach the real output. Top-1 accuracy: REPLACE · No-match rejection: REPLACE

## API tests
Command: `python -m pytest -q` · Result: REPLACE (date, commit)

## Device matrix (at least 2 devices or materially different configurations)

| Device | Android version | Screen / font size | APK installed w/o Expo Go | Online flow | Offline flow | Notes |
|---|---|---|---|---|---|---|
| Samsung | Android 15 | Default screen/font size | Passed | Passed | Passed | App tested on Samsung device |
| Samsung — Different configuration | Android 15 | Increased font size | Passed | Passed | Passed | Layout and workflows tested with larger font |

## Fixed issues (at least 2, each linked to an issue and a commit)

| Issue URL | How reproduced | Fix commit URL |
|---|---|---|
|https://github.com/cyithia-abijuru/agrisoko-pocket-g02/issues/1 | Open the app and reproduce the first reported bug; verify the fix after restarting the app. | REPLACE_WITH_FIX_COMMIT_1_URL |
|https://github.com/cyithia-abijuru/agrisoko-pocket-g02/issues/2 | Reproduce the second reported bug and verify the corrected behavior. | REPLACE_WITH_FIX_COMMIT_2_URL |
