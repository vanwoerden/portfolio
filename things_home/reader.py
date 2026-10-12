"""Read-only extraction of the "Home" subset from the Things 3 SQLite database."""
from __future__ import annotations

import glob
import os
import sqlite3
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional

THINGS_GLOB = os.path.expanduser(
    "~/Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/"
    "ThingsData-*/Things Database.thingsdatabase/main.sqlite"
)
HOME_AREA = "Home"

TYPE_TODO, TYPE_PROJECT, TYPE_HEADING = 0, 1, 2
STATUS_OPEN, STATUS_CANCELED, STATUS_DONE = 0, 2, 3


def find_database() -> str:
    paths = glob.glob(THINGS_GLOB)
    if not paths:
        raise FileNotFoundError("Things database not found; is Things 3 installed?")
    return paths[0]


def decode_date(value: Optional[int]) -> Optional[str]:
    """Things packs dates as year<<16 | month<<12 | day<<7."""
    if not value:
        return None
    return date(value >> 16, (value >> 12) & 0xF, (value >> 7) & 0x1F).isoformat()


def decode_ts(value: Optional[float]) -> Optional[str]:
    if not value:
        return None
    return datetime.fromtimestamp(value, tz=timezone.utc).isoformat()


def connect(path: Optional[str] = None) -> sqlite3.Connection:
    path = path or find_database()
    conn = sqlite3.connect("file:%s?mode=ro" % path, uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def read_home(conn: sqlite3.Connection, area_title: str = HOME_AREA) -> Dict[str, Any]:
    """Return projects and to-dos that live in the Home area.

    A to-do is in scope if its area is Home, its project is in Home, or its
    heading belongs to a project in Home. Recurring templates are skipped.
    """
    area = conn.execute(
        "SELECT uuid, title FROM TMArea WHERE lower(title) = lower(?)", (area_title,)
    ).fetchone()
    if area is None:
        return {"area": None, "projects": [], "todos": []}
    area_id = area["uuid"]

    tasks = conn.execute(
        """SELECT uuid, type, status, title, notes, start, startDate, deadline,
                  startBucket, todayIndex, "index" AS idx, stopDate,
                  area, project, heading
           FROM TMTask
           WHERE trashed = 0 AND rt1_recurrenceRule IS NULL"""
    ).fetchall()
    by_id = {t["uuid"]: t for t in tasks}

    tags: Dict[str, List[str]] = {}
    for r in conn.execute(
        "SELECT tt.tasks AS t, g.title AS title FROM TMTaskTag tt JOIN TMTag g ON g.uuid = tt.tags"
    ):
        tags.setdefault(r["t"], []).append(r["title"])

    checklists: Dict[str, List[Dict[str, Any]]] = {}
    for r in conn.execute(
        'SELECT task, title, status FROM TMChecklistItem ORDER BY "index"'
    ):
        checklists.setdefault(r["task"], []).append(
            {"title": r["title"], "done": r["status"] == STATUS_DONE}
        )

    def project_of(t: sqlite3.Row) -> Optional[str]:
        if t["project"]:
            return t["project"]
        if t["heading"]:
            h = by_id.get(t["heading"])
            return h["project"] if h else None
        return None

    home_projects = {
        t["uuid"]: t for t in tasks if t["type"] == TYPE_PROJECT and t["area"] == area_id
    }

    todos: List[Dict[str, Any]] = []
    for t in tasks:
        if t["type"] != TYPE_TODO or t["status"] == STATUS_CANCELED:
            continue
        pid = project_of(t)
        if t["area"] != area_id and pid not in home_projects:
            continue
        heading = by_id.get(t["heading"]) if t["heading"] else None
        todos.append(
            {
                "id": t["uuid"],
                "title": t["title"],
                "notes": t["notes"] or "",
                "done": t["status"] == STATUS_DONE,
                "project_id": pid if pid in home_projects else None,
                "heading": heading["title"] if heading else None,
                "start": {0: "inbox", 1: "anytime", 2: "someday"}.get(t["start"], "anytime"),
                "start_date": decode_date(t["startDate"]),
                "deadline": decode_date(t["deadline"]),
                "evening": bool(t["startBucket"]),
                "today_index": t["todayIndex"],
                "index": t["idx"],
                "completed_at": decode_ts(t["stopDate"]),
                "tags": sorted(tags.get(t["uuid"], [])),
                "checklist": checklists.get(t["uuid"], []),
            }
        )

    projects: List[Dict[str, Any]] = []
    for pid, p in home_projects.items():
        if p["status"] == STATUS_CANCELED:
            continue
        mine = [x for x in todos if x["project_id"] == pid]
        projects.append(
            {
                "id": pid,
                "title": p["title"],
                "notes": p["notes"] or "",
                "done": p["status"] == STATUS_DONE,
                "deadline": decode_date(p["deadline"]),
                "index": p["idx"],
                "total": len(mine),
                "completed": sum(1 for x in mine if x["done"]),
                "tags": sorted(tags.get(pid, [])),
            }
        )
    projects.sort(key=lambda p: p["index"])
    return {"area": {"id": area_id, "title": area["title"]}, "projects": projects, "todos": todos}
