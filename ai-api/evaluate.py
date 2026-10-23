"""Evaluate the matcher on recorded queries.

Reports top-1 accuracy (member queries), no-match rejection accuracy and an
error table. Usage: python evaluate.py [--threshold 0.45] [--out ../docs/AI_EVAL.md]
"""
import argparse
import json
from pathlib import Path

from app import engine as E

HERE = Path(__file__).parent


def run(threshold: float):
    members = E.load_members()
    eng = E.MatchEngine(members, threshold)
    qs = json.loads((HERE / "data" / "eval_queries.json").read_text(encoding="utf-8"))["queries"]
    rows = []
    for item in qs:
        r = eng.match(item["q"])
        got = r.member["id"] if r.matched else None
        rows.append({"q": item["q"], "expected": item["expected"], "got": got,
                     "conf": r.confidence, "ok": got == item["expected"]})
    pos = [r for r in rows if r["expected"] is not None]
    neg = [r for r in rows if r["expected"] is None]
    return rows, sum(r["ok"] for r in pos) / len(pos), sum(r["ok"] for r in neg) / len(neg), len(pos), len(neg)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--threshold", type=float, default=E.CONFIDENCE_THRESHOLD)
    ap.add_argument("--sweep", action="store_true", help="try several thresholds")
    ap.add_argument("--out")
    a = ap.parse_args()

    if a.sweep:
        print("threshold | top1 | no-match rejection")
        for t in (0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50):
            _, top1, rej, _, _ = run(t)
            print(f"{t:.2f}      | {top1:.2%} | {rej:.2%}")
        return

    rows, top1, rej, npos, nneg = run(a.threshold)
    lines = [
        f"# AI evaluation (threshold {a.threshold})", "",
        f"- Member queries: {npos}, top-1 accuracy: {top1:.2%}",
        f"- No-match queries: {nneg}, rejection accuracy: {rej:.2%}", "",
        "| Query | Expected | Got | Confidence | OK |", "|---|---|---|---|---|",
    ]
    for r in rows:
        lines.append(f"| {r['q']} | {r['expected']} | {r['got']} | {r['conf']:.3f} | {'yes' if r['ok'] else '**NO**'} |")
    errs = [r for r in rows if not r["ok"]]
    lines += ["", "## Error table", ""]
    lines += ["None."] if not errs else [f"- `{r['q']}`: expected {r['expected']}, got {r['got']} ({r['conf']:.3f})" for r in errs]
    text = "\n".join(lines)
    print(text)
    if a.out:
        Path(a.out).write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
