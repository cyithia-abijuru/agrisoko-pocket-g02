"""FastAPI service for AgriSoko Pocket G02."""
from __future__ import annotations

import logging
import os
import subprocess
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from . import engine as E

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("agrisoko")

DATA_PATH = Path(os.environ.get("MEMBERS_PATH", E.DEFAULT_DATA))
SERVICE_VERSION = "1.0.0"
LIMITATIONS = [
    "Matches only the approved members.json records; unknown people are never invented.",
    "TF-IDF is lexical: paraphrases with no shared words may not match.",
    "Confidence is cosine similarity, not a probability.",
    "Evidence links are those stored in members.json and are not re-verified at runtime.",
]


def _build_commit() -> str:
    env = os.environ.get("BUILD_COMMIT")
    if env:
        return env
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"], stderr=subprocess.DEVNULL, text=True
        ).strip()
    except Exception:
        return "unknown"


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=300)


class AskResponse(BaseModel):
    query: str
    matched: bool
    member_id: str | None = None
    member_name: str | None = None
    confidence: float
    reason: str
    matched_terms: list[str] = []
    introduction: str | None = None
    evidence_links: dict[str, str] = {}
    suggestions: list[str] = []
    model_version: str
    group_code: str


def create_app(data_path: Path | str = DATA_PATH, threshold: float = E.CONFIDENCE_THRESHOLD) -> FastAPI:
    app = FastAPI(title="AgriSoko Pocket API", version=SERVICE_VERSION)
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"], allow_headers=["*"])

    state: dict[str, Any] = {"engine": None, "error": None, "members": []}
    try:
        members = E.load_members(data_path)
        state["members"] = members
        state["engine"] = E.MatchEngine(members, threshold)
        state["fingerprint"] = E.dataset_fingerprint(data_path)
    except Exception as exc:  # empty/invalid dataset -> service up, but degraded
        state["error"] = str(exc)
        log.error("index build failed: %s", exc)
    state["commit"] = _build_commit()

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception):
        log.exception("unhandled error")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    def _need_engine() -> E.MatchEngine:
        if state["engine"] is None:
            raise HTTPException(status_code=503, detail="Member dataset unavailable")
        return state["engine"]

    @app.get("/health")
    def health():
        return {
            "status": "ok" if state["engine"] else "degraded",
            "version": SERVICE_VERSION,
            "group_code": E.GROUP_CODE,
        }

    @app.get("/members")
    def members():
        _need_engine()
        return [
            {
                "id": m["id"], "fullName": m["fullName"], "aliases": m["aliases"],
                "role": m["role"], "skills": m["skills"], "feature": m["feature"],
            }
            for m in state["members"]
        ]

    @app.get("/members/{member_id}")
    def member(member_id: str):
        _need_engine()
        for m in state["members"]:
            if m["id"] == member_id:
                return m
        raise HTTPException(status_code=404, detail=f"Member '{member_id}' not found")

    @app.post("/ask", response_model=AskResponse)
    def ask(req: AskRequest):
        eng = _need_engine()
        if not req.question.strip():
            raise HTTPException(status_code=422, detail="Question must not be blank")
        r = eng.match(req.question)
        log.info("ask q=%r matched=%s conf=%.3f", req.question, r.matched, r.confidence)
        if not r.matched:
            return AskResponse(
                query=req.question, matched=False, confidence=r.confidence, reason=r.reason,
                suggestions=r.suggestions, model_version=E.MODEL_VERSION, group_code=E.GROUP_CODE,
            )
        m = r.member
        links = m.get("evidenceLinks") or {}
        return AskResponse(
            query=req.question, matched=True, member_id=m["id"], member_name=m["fullName"],
            confidence=r.confidence, reason=r.reason, matched_terms=r.matched_terms,
            introduction=E.generate_introduction(m),
            evidence_links={k: str(v) for k, v in links.items()},
            model_version=E.MODEL_VERSION, group_code=E.GROUP_CODE,
        )

    @app.get("/model-info")
    def model_info():
        eng = _need_engine()
        return {
            "model_version": E.MODEL_VERSION,
            "vectorizer": "TfidfVectorizer word(1-2) + char_wb(3-5), mean cosine similarity",
            "threshold": eng.threshold,
            "exact_name_boost": E.EXACT_BOOST,
            "dataset_fingerprint_sha256": state["fingerprint"],
            "member_count": len(state["members"]),
            "limitations": LIMITATIONS,
            "build_commit": state["commit"],
            "group_code": E.GROUP_CODE,
        }

    return app


app = create_app()
