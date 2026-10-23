"""Deterministic TF-IDF member-matching engine (no generative AI).

Rules (documented for the report):
1. One searchable document per member: name, aliases, role, skills, feature,
   problem, contribution and evidence summary (all taken from members.json).
2. Two TF-IDF views (word 1-2 grams and char_wb 3-5 grams); the final cosine
   score is the mean of the two views.
3. Exact name / alias boost: if a normalized name or alias appears as a whole
   word sequence in the normalized query, the score is raised to at least
   EXACT_BOOST (0.95). Single-token aliases shorter than 3 characters are ignored.
4. Confidence threshold CONFIDENCE_THRESHOLD (default 0.20, started at 0.45 and tuned on recorded queries). Below it the
   engine returns no match.
5. Only fields stored in members.json are returned or used in the introduction.
"""
from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

MODEL_VERSION = "agrisoko-tfidf-1.0.0"
GROUP_CODE = "G02"
CONFIDENCE_THRESHOLD = 0.20  # started at 0.45; lowered after recorded-query sweep (see docs/AI_EVAL.md)
EXACT_BOOST = 0.95

REQUIRED_KEYS = [
    "fullName", "registrationNumber", "aliases", "githubUsername", "role",
    "skills", "targetUser", "problem", "contribution", "feature",
    "outcomeMetric", "evidenceLinks", "testerFeedback", "introductionDraft",
]
# Optional fields may be empty/None; they must never remove a member.
OPTIONAL_KEYS = {"outcomeMetric", "testerFeedback", "evidenceLinks"}

# Words that carry no member information in a question.
QUESTION_STOPWORDS = {
    "who", "what", "which", "tell", "me", "about", "profile", "the", "is", "of",
    "a", "an", "and", "in", "on", "for", "to", "does", "did", "do", "show",
    "member", "team", "person", "please", "how", "can", "i", "ask", "find",
    "built", "build", "made", "make", "worked", "work", "handles", "handled",
    "responsible", "was", "are", "by", "with", "her", "his", "their", "my",
}

DEFAULT_DATA = Path(__file__).resolve().parent.parent / "data" / "members.json"


def normalize(text: str) -> str:
    """Lowercase, strip accents and punctuation, collapse spaces. Aliases kept."""
    text = unicodedata.normalize("NFKD", str(text))
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-z0-9\s]", " ", text.lower())
    return re.sub(r"\s+", " ", text).strip()


def strip_question_words(text: str) -> str:
    return " ".join(t for t in normalize(text).split() if t not in QUESTION_STOPWORDS)


def load_members(path: Path | str = DEFAULT_DATA) -> list[dict[str, Any]]:
    """Read and validate members.json. Raises ValueError on invalid data."""
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(raw, list) or len(raw) == 0:
        raise ValueError("members.json must contain a non-empty list of members")
    members = []
    for i, m in enumerate(raw):
        missing = [k for k in REQUIRED_KEYS if k not in m]
        if missing:
            raise ValueError(f"member {i} missing keys: {missing}")
        for k in ("fullName", "role", "feature", "contribution"):
            if not str(m[k]).strip():
                raise ValueError(f"member {i} has empty required field '{k}'")
        m = dict(m)
        m.setdefault("id", f"m{i + 1}")
        members.append(m)
    ids = [m["id"] for m in members]
    if len(set(ids)) != len(ids):
        raise ValueError("duplicate member ids")
    return members


def dataset_fingerprint(path: Path | str = DEFAULT_DATA) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def member_document(m: dict[str, Any]) -> str:
    links = m.get("evidenceLinks") or {}
    evidence = " ".join(str(k) for k in links) if isinstance(links, dict) else ""
    parts = [
        m["fullName"], " ".join(m.get("aliases") or []), m["role"],
        " ".join(m.get("skills") or []), m["feature"], m["problem"],
        m["contribution"], evidence, str(m.get("outcomeMetric") or ""),
    ]
    return normalize(" ".join(parts))


@dataclass
class MatchResult:
    matched: bool
    member: dict[str, Any] | None
    confidence: float
    reason: str
    matched_terms: list[str]
    suggestions: list[str]


class MatchEngine:
    def __init__(self, members: list[dict[str, Any]], threshold: float = CONFIDENCE_THRESHOLD):
        if not members:
            raise ValueError("cannot build an index from an empty dataset")
        self.members = members
        self.threshold = threshold
        self.df = pd.DataFrame(
            {"id": [m["id"] for m in members], "doc": [member_document(m) for m in members]}
        )
        self.word_vec = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
        self.char_vec = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), sublinear_tf=True)
        self.word_mat = self.word_vec.fit_transform(self.df["doc"])
        self.char_mat = self.char_vec.fit_transform(self.df["doc"])

    # ------------------------------------------------------------------
    def _exact_hits(self, nq: str) -> dict[int, str]:
        padded = f" {nq} "
        firsts = [normalize(re.sub(r"\(.*?\)", "", m["fullName"])).split(" ")[0] for m in self.members]
        hits: dict[int, str] = {}
        for i, m in enumerate(self.members):
            clean_full = re.sub(r"\(.*?\)", "", m["fullName"]).strip()
            names = [clean_full] + list(m.get("aliases") or [])
            # first name counts as an alias only when it is unique in the dataset
            if firsts.count(firsts[i]) == 1:
                names.append(firsts[i])
            for n in names:
                nn = normalize(n)
                if len(nn) < 3:
                    continue
                if f" {nn} " in padded:
                    hits[i] = n
                    break
        return hits

    def match(self, question: str) -> MatchResult:
        nq = normalize(question)
        cleaned = strip_question_words(question)
        suggestions = [m["fullName"] for m in self.members] + [m["role"] for m in self.members]
        if not cleaned:
            return MatchResult(False, None, 0.0, "The question has no searchable terms.", [], suggestions)

        w = cosine_similarity(self.word_vec.transform([cleaned]), self.word_mat)[0]
        c = cosine_similarity(self.char_vec.transform([cleaned]), self.char_mat)[0]
        scores = (w + c) / 2.0

        exact = self._exact_hits(nq)
        reasons: dict[int, str] = {}
        for i, name in exact.items():
            scores[i] = max(scores[i], EXACT_BOOST)
            reasons[i] = f"exact name or alias match: '{name}'"

        best = int(np.argmax(scores))
        conf = float(round(min(scores[best], 1.0), 4))
        vocab = set(self.word_vec.vocabulary_)
        terms = [t for t in cleaned.split() if t in vocab and t in self.df["doc"][best].split()]

        if conf < self.threshold:
            return MatchResult(
                False, None, conf,
                "No confident match was found. Try a member name, role or feature.",
                [], suggestions,
            )
        reason = reasons.get(best) or (
            "matched terms: " + ", ".join(sorted(set(terms))) if terms else "TF-IDF similarity"
        )
        return MatchResult(True, self.members[best], conf, reason, sorted(set(terms)), [])


def generate_introduction(m: dict[str, Any]) -> str:
    """Re-organize APPROVED facts only. No new facts, metrics or quotes."""
    first = m["fullName"].split(" ")[0]
    text = f"My name is {first}. I am the {m['role']}. I work for {m['targetUser']}. "
    text += f"The problem: {m['problem']} I built: {m['feature']}. {m['contribution']}"
    if m.get("outcomeMetric"):
        text += f" Verified result: {m['outcomeMetric']}."
    else:
        text += " No verified outcome metric has been recorded yet."
    if m.get("testerFeedback"):
        text += f" Tester feedback: {m['testerFeedback']}"
    return text
