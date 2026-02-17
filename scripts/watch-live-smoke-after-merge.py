#!/usr/bin/env python3
"""Watch main branch for new merges and run live smoke tests after a delay.

Strategy:
- Poll GitHub for latest main SHA.
- When SHA changes, record firstSeenAt for that SHA.
- Once the SHA has been seen for >= delaySeconds and not yet tested, run smoke-test.sh
  against the live site and print PASS/FAIL with details.

Intended to be run from cron every few minutes.

State:
  /home/simon/.openclaw/workspace/memory/www-simonpainter-live-smoke.json
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from pathlib import Path

REPO = "simonpainter/www.simonpainter.com"
DEFAULT_STATE = Path("/home/simon/.openclaw/workspace/memory/www-simonpainter-live-smoke.json")
DELAY_SECONDS = int(os.environ.get("SMOKE_DELAY_SECONDS", "300"))  # 5 minutes
BASE_URL = os.environ.get(
    "BASE_URL", "http://www.simonpainter.com.s3-website.eu-west-2.amazonaws.com"
)


def run(cmd: list[str], *, check: bool = True) -> str:
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if check and p.returncode != 0:
        raise subprocess.CalledProcessError(p.returncode, cmd, output=p.stdout)
    return p.stdout


def gh_latest_sha(repo: str) -> str:
    # Use gh api for reliability
    out = run(["gh", "api", f"repos/{repo}/commits/main", "-q", ".sha"])
    return out.strip().strip('"')


def load_state(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def smoke(base_url: str) -> tuple[int, str]:
    env = os.environ.copy()
    env["BASE_URL"] = base_url
    script = "/home/simon/.openclaw/workspace/repos/www.simonpainter.com/scripts/smoke-test.sh"
    p = subprocess.run(["bash", script], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return p.returncode, p.stdout


def main() -> int:
    state = load_state(DEFAULT_STATE)
    now = int(time.time())

    sha = gh_latest_sha(REPO)

    # On SHA change, reset timer
    if state.get("current_sha") != sha:
        state["current_sha"] = sha
        state["first_seen_at"] = now
        state["last_tested_sha"] = state.get("last_tested_sha")
        save_state(DEFAULT_STATE, state)
        print(f"INFO: new main SHA seen: {sha[:12]} (starting {DELAY_SECONDS}s timer)")
        return 0

    first_seen = int(state.get("first_seen_at") or now)
    last_tested = state.get("last_tested_sha")

    age = now - first_seen
    if sha == last_tested:
        print("NO_ACTION")
        return 0

    if age < DELAY_SECONDS:
        print(f"INFO: sha {sha[:12]} not old enough yet ({age}s < {DELAY_SECONDS}s)")
        return 0

    rc, out = smoke(BASE_URL)
    state["last_tested_sha"] = sha
    state["last_tested_at"] = now
    state["last_result"] = "PASS" if rc == 0 else "FAIL"
    save_state(DEFAULT_STATE, state)

    if rc == 0:
        print(f"PASS: live smoke ok for {sha}\n{out}")
        return 0

    print(f"FAIL: live smoke failed for {sha}\n{out}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
