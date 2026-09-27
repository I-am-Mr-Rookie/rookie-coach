"""Validate the version 1 synthetic evidence fixture with the Python standard library."""

import json
import re
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "fixtures/codeforces-evidence-v1.json"
ACCOUNT = {"schemaVersion", "platform", "namespace", "handle"}
PROBLEM = {"platform", "problemId", "name"}
PROBLEM_OPTIONAL = {"contestId", "index", "difficulty", "tags"}
SUBMISSION = ACCOUNT | {
    "submissionId", "problem", "verdict", "language", "submittedAt", "source",
    "sourceStatus", "captureMethod", "provenance", "capturedAt",
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def fields(value, required, optional=()):
    require(isinstance(value, dict), "record must be an object")
    require(required <= value.keys() <= required | set(optional), "missing or unknown fields")


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def integer(value, minimum):
    return type(value) is int and value >= minimum


def validate(data):
    fields(data, {"schemaVersion", "account", "submissions"})
    require(data["schemaVersion"] == 1 and type(data["schemaVersion"]) is int, "fixture version")
    account = data["account"]
    fields(account, ACCOUNT)
    require(type(account["schemaVersion"]) is int and account["schemaVersion"] == 1, "account version")
    require(all(nonempty(account[k]) for k in ("platform", "namespace", "handle")), "account identity")
    require(isinstance(data["submissions"], list), "submissions must be an array")
    seen = set()
    for submission in data["submissions"]:
        fields(submission, SUBMISSION)
        require(type(submission["schemaVersion"]) is int and submission["schemaVersion"] == 1, "submission version")
        require(all(submission[k] == account[k] for k in ("platform", "namespace", "handle")), "account mismatch")
        require(nonempty(submission["submissionId"]), "submission ID")
        require(submission["submissionId"] not in seen, "duplicate submission ID")
        seen.add(submission["submissionId"])
        problem = submission["problem"]
        fields(problem, PROBLEM, PROBLEM_OPTIONAL)
        require(problem["platform"] == account["platform"], "problem platform mismatch")
        require(all(nonempty(problem[k]) for k in ("problemId", "name")), "problem identity")
        if "contestId" in problem:
            require(integer(problem["contestId"], 1), "contest ID")
        if "index" in problem:
            require(nonempty(problem["index"]), "problem index")
        if "difficulty" in problem:
            require(integer(problem["difficulty"], 0), "difficulty")
        if "tags" in problem:
            tags = problem["tags"]
            require(isinstance(tags, list) and all(nonempty(tag) for tag in tags), "tags")
            require(len(tags) == len(set(tags)), "duplicate tags")
        require(submission["verdict"] is None or nonempty(submission["verdict"]), "verdict")
        require(nonempty(submission["language"]), "language")
        require(integer(submission["submittedAt"], 0), "submission time")
        require(submission["sourceStatus"] in ("available", "unavailable", "not-collected"), "source status")
        require((nonempty(submission["source"]) if submission["sourceStatus"] == "available"
                 else submission["source"] is None), "source/status mismatch")
        require(submission["captureMethod"] in ("api", "saved-page", "user-export"), "capture method")
        require(nonempty(submission["provenance"]), "provenance")
        captured = submission["capturedAt"]
        require(isinstance(captured, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", captured), "capture time format")
        try:
            datetime.strptime(captured, "%Y-%m-%dT%H:%M:%SZ")
        except ValueError as exc:
            raise ValueError("capture time must be UTC ISO 8601 seconds") from exc


if __name__ == "__main__":
    validate(json.loads(FIXTURE.read_text(encoding="utf-8")))
    print(f"PASS: {FIXTURE.relative_to(ROOT)} matches evidence contract v1")
