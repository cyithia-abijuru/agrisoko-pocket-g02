"""Validate members.json, build the index and write fingerprint + model metadata.

Usage: python build_index.py [path/to/members.json]
"""
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from app import engine as E


def main(path: str | None = None) -> int:
    p = Path(path) if path else E.DEFAULT_DATA
    members = E.load_members(p)  # raises ValueError if invalid
    eng = E.MatchEngine(members)
    try:
        commit = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], text=True,
                                         stderr=subprocess.DEVNULL).strip()
    except Exception:
        commit = "unknown"
    meta = {
        "model_version": E.MODEL_VERSION,
        "group_code": E.GROUP_CODE,
        "vectorizer": "word(1-2) + char_wb(3-5) TF-IDF, cosine",
        "threshold": eng.threshold,
        "members": len(members),
        "vocabulary_word": len(eng.word_vec.vocabulary_),
        "vocabulary_char": len(eng.char_vec.vocabulary_),
        "dataset_sha256": E.dataset_fingerprint(p),
        "build_commit": commit,
        "built_at_utc": datetime.now(timezone.utc).isoformat(),
    }
    out = Path(__file__).parent / "build" / "model_meta.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(json.dumps(meta, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else None))
    except ValueError as e:
        print(f"VALIDATION FAILED: {e}", file=sys.stderr)
        sys.exit(1)
