import json
import pytest
from fastapi.testclient import TestClient

from app import engine as E
from app.main import create_app


@pytest.fixture(scope="module")
def client():
    return TestClient(create_app())


@pytest.fixture(scope="module")
def eng():
    return E.MatchEngine(E.load_members())


def test_exact_name(eng):
    r = eng.match("Tell me about Member Two")
    assert r.matched and r.member["id"] == "m2"
    assert "exact" in r.reason


def test_alias(eng):
    r = eng.match("what does the AI Engineer do")
    assert r.matched and r.member["id"] == "m2"


def test_role_query(eng):
    r = eng.match("Who is the API and integration engineer?")
    assert r.matched and r.member["id"] == "m3"


def test_feature_query(eng):
    r = eng.match("Who built offline mode?")
    assert r.matched and r.member["id"] == "m4"


@pytest.mark.parametrize("q", [
    "What is the weather in Kigali today?", "Recipe for cooking potatoes",
    "who won the football match", "tell me something", "bitcoin price forecast",
])
def test_no_match(eng, q):
    r = eng.match(q)
    assert not r.matched and r.member is None and r.suggestions


def test_missing_question(client):
    assert client.post("/ask", json={}).status_code == 422


def test_empty_and_long_question(client):
    assert client.post("/ask", json={"question": ""}).status_code == 422
    assert client.post("/ask", json={"question": "x" * 301}).status_code == 422
    assert client.post("/ask", json={"question": "   "}).status_code == 422


def test_empty_dataset(tmp_path):
    p = tmp_path / "members.json"
    p.write_text("[]")
    with pytest.raises(ValueError):
        E.load_members(p)
    c = TestClient(create_app(p))
    assert c.get("/health").json()["status"] == "degraded"
    assert c.post("/ask", json={"question": "hello there"}).status_code == 503


def test_missing_optional_field_keeps_member(tmp_path):
    data = json.loads(open(E.DEFAULT_DATA, encoding="utf-8").read())
    data[0]["outcomeMetric"] = None
    data[0]["testerFeedback"] = None
    data[0]["evidenceLinks"] = {}
    p = tmp_path / "m.json"
    p.write_text(json.dumps(data))
    assert len(E.load_members(p)) == len(data)


def test_health(client):
    j = client.get("/health").json()
    assert j["status"] == "ok" and j["group_code"] == "G02" and "version" in j


def test_members_directory_safe(client):
    rows = client.get("/members").json()
    assert 4 <= len(rows) <= 6
    for r in rows:
        assert "registrationNumber" not in r and "githubUsername" not in r


def test_member_detail_and_404(client):
    assert client.get("/members/m1").json()["fullName"]
    assert client.get("/members/nope").status_code == 404


def test_ask_schema(client):
    j = client.post("/ask", json={"question": "Tell me about Member Three"}).json()
    for k in ["query", "matched", "member_id", "confidence", "reason",
              "introduction", "evidence_links", "model_version", "group_code"]:
        assert k in j
    assert j["matched"] and j["member_id"] == "m3"


def test_no_invented_metric(client):
    j = client.post("/ask", json={"question": "Tell me about Member One"}).json()
    assert "No verified outcome metric" in j["introduction"]
    links = json.load(open(E.DEFAULT_DATA, encoding="utf-8"))[0]["evidenceLinks"]
    assert set(j["evidence_links"].values()) <= set(links.values())


def test_model_info(client):
    j = client.get("/model-info").json()
    assert j["dataset_fingerprint_sha256"] == E.dataset_fingerprint()
    for k in ["vectorizer", "threshold", "limitations", "build_commit"]:
        assert k in j
