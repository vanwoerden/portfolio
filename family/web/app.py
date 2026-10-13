from __future__ import annotations

import os
from datetime import date, datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from things_home import snapshot, views

HERE = os.path.dirname(__file__)
SNAPSHOT_PATH = os.environ.get("THINGS_HOME_SNAPSHOT", snapshot.DEFAULT_PATH)

app = FastAPI(title="Home")
app.add_middleware(GZipMiddleware, minimum_size=1024)  # carbon.css is ~1.2 MB raw
app.mount("/static", StaticFiles(directory=os.path.join(HERE, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(HERE, "templates"))


def _fmt_day(iso: str) -> str:
    return date.fromisoformat(iso).strftime("%a %-d %b")


def _fmt_time(iso: str) -> str:
    return datetime.fromisoformat(iso).strftime("%H:%M")


def _asset_version(name: str) -> int:
    """Cache-buster so a rebuilt stylesheet is never served stale."""
    return int(os.path.getmtime(os.path.join(HERE, "static", name)))


templates.env.globals["asset_version"] = _asset_version
templates.env.filters["day"] = _fmt_day
templates.env.filters["time"] = _fmt_time


def _fmt_localtime(iso: str) -> str:
    return datetime.fromisoformat(iso).astimezone().strftime("%a %H:%M")


templates.env.filters["localtime"] = _fmt_localtime


def _page(request: Request, name: str, **ctx):
    snap = snapshot.load(SNAPSHOT_PATH)
    if snap is None:
        return templates.TemplateResponse(
            request, "empty.html", {"nav": name, "synced": None}, status_code=503
        )
    age = (datetime.now(timezone.utc) - datetime.fromisoformat(snap["generated_at"])).total_seconds()
    ctx.update(nav=name, synced=snap["generated_at"], stale=age > 3600, today=date.today())
    return templates.TemplateResponse(request, name + ".html", ctx_with(snap, ctx))


def ctx_with(snap, ctx):
    ctx["snap"] = snap
    return ctx


@app.get("/")
def index():
    return RedirectResponse("/today")


@app.get("/today")
def today(request: Request):
    snap = snapshot.load(SNAPSHOT_PATH)
    data = views.today_view(snap, date.today()) if snap else None
    return _page(request, "today", v=data)


@app.get("/week")
def week(request: Request):
    snap = snapshot.load(SNAPSHOT_PATH)
    data = views.week_view(snap, date.today()) if snap else None
    return _page(request, "week", v=data)


@app.get("/projects")
def projects(request: Request):
    snap = snapshot.load(SNAPSHOT_PATH)
    data = views.projects_view(snap, date.today()) if snap else None
    return _page(request, "projects", v=data)


@app.get("/projects/{project_id}")
def project(request: Request, project_id: str):
    snap = snapshot.load(SNAPSHOT_PATH)
    data = views.projects_view(snap, date.today()) if snap else []
    match = next((p for p in data if p["id"] == project_id), None)
    if snap and match is None:
        raise HTTPException(404, "Unknown project")
    return _page(request, "project", p=match)


@app.get("/api/status")
def status():
    snap = snapshot.load(SNAPSHOT_PATH)
    return {"synced": snap["generated_at"] if snap else None}
