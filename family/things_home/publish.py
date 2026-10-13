"""Render the family pages and upload them to ernst.works/family.

Private data (to-dos, calendar events) must never be committed to git, because
the portfolio repo is public. Instead the sync agent renders every page with the
same templates as the local app and uploads the result to a Netlify edge
function, which stores it in Netlify Blobs behind the family token gate.
"""
from __future__ import annotations

import hashlib
import json
import os
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jinja2

from web import templating

from . import views

BASE = "/family"
STATIC_BASE = "/family/web/static"
DAYS_BACK, DAYS_FORWARD = 1, 14  # pages are pre-rendered per viewer date
HEARTBEAT_SECONDS = 15 * 60  # re-upload at least this often so "synced" stays honest
ROOT = os.path.dirname(os.path.dirname(__file__))
ENV_FILE = os.environ.get("FAMILY_ENV_FILE", os.path.join(os.path.dirname(ROOT), ".env"))
STATE_PATH = os.path.join(ROOT, "data", "publish_state.json")


def make_env() -> jinja2.Environment:
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(templating.TEMPLATES_DIR),
        autoescape=jinja2.select_autoescape(["html"]),
    )
    templating.configure(env, base=BASE, static_base=STATIC_BASE)
    return env


def render_bundle(snapshot: Dict[str, Any], today: date, env: Optional[jinja2.Environment] = None) -> Dict[str, Any]:
    """Pages keyed by the viewer's local date, because "today" differs by timezone."""
    env = env or make_env()
    common = {"snap": snapshot, "synced": snapshot["generated_at"], "stale": False}

    def render(template: str, **ctx: Any) -> str:
        return env.get_template(template).render(**common, **ctx)

    pages: Dict[str, str] = {}
    dates = [today + timedelta(days=i) for i in range(-DAYS_BACK, DAYS_FORWARD + 1)]
    for d in dates:
        iso = d.isoformat()
        pages["today/" + iso] = render("today.html", nav="today", today=d, v=views.today_view(snapshot, d))
        pages["week/" + iso] = render("week.html", nav="week", today=d, v=views.week_view(snapshot, d))

    projects = views.projects_view(snapshot, today)
    pages["projects"] = render("projects.html", nav="projects", today=today, v=projects)
    for p in projects:
        pages["project/" + p["id"]] = render("project.html", nav="project", today=today, p=p)
    return {
        "generated_at": snapshot["generated_at"],
        "dates": [d.isoformat() for d in dates],
        "pages": pages,
    }


def digest(snapshot: Dict[str, Any], today: date) -> str:
    """Changes when the data changes or the date range rolls over to a new day."""
    body = {k: v for k, v in snapshot.items() if k != "generated_at"}
    raw = json.dumps(body, sort_keys=True) + today.isoformat()
    return hashlib.sha256(raw.encode()).hexdigest()


def needs_upload(state: Dict[str, Any], current: str, now: float) -> bool:
    return state.get("digest") != current or now - state.get("uploaded_at", 0) >= HEARTBEAT_SECONDS


def load_env(path: Optional[str] = None) -> Dict[str, str]:
    env: Dict[str, str] = {}
    try:
        with open(path or ENV_FILE) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                env[key.strip()] = value.strip().strip("'\"")
    except FileNotFoundError:
        pass
    return env


def _read_state() -> Dict[str, Any]:
    try:
        with open(STATE_PATH) as f:
            return json.load(f)
    except (FileNotFoundError, ValueError):
        return {}


def _write_state(state: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    with open(STATE_PATH, "w") as f:
        json.dump(state, f)


def upload(bundle: Dict[str, Any], site_url: str, secret: str) -> None:
    req = urllib.request.Request(
        site_url.rstrip("/") + "/family-ingest",
        data=json.dumps(bundle).encode(),
        method="POST",
        headers={"Authorization": "Bearer " + secret, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as res:
        if res.status != 200:
            raise RuntimeError("ingest returned %s" % res.status)


def publish(snapshot: Dict[str, Any], today: Optional[date] = None, now: Optional[float] = None) -> str:
    """Upload the family pages if needed. Returns a short status; never raises."""
    try:
        cfg = load_env()
        secret = cfg.get("FAMILY_INGEST_SECRET")
        if not secret:
            return "publish disabled (no FAMILY_INGEST_SECRET in %s)" % ENV_FILE
        today = today or date.today()
        now = now if now is not None else datetime.now(timezone.utc).timestamp()
        current = digest(snapshot, today)
        state = _read_state()
        if not needs_upload(state, current, now):
            return "publish skipped (unchanged)"
        bundle = render_bundle(snapshot, today)
        upload(bundle, cfg.get("SITE_URL", "https://ernst.works"), secret)
        _write_state({"digest": current, "uploaded_at": now})
        return "published %d pages" % len(bundle["pages"])
    except (urllib.error.URLError, OSError, RuntimeError, jinja2.TemplateError) as exc:
        return "publish failed: %s" % exc
