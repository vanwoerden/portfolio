"""Pure functions turning a snapshot into the Today / Week / Projects views."""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Dict, List


def _is_planned(todo: Dict[str, Any]) -> bool:
    """Things stores a to-do scheduled for a future date as "someday" with a
    start date, so only dateless someday items are truly unscheduled."""
    return todo["start"] != "someday" or bool(todo["start_date"])


def _by_order(todos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(todos, key=lambda t: (t["today_index"] or 0, t["index"] or 0))


def _decorate(snapshot: Dict[str, Any], todo: Dict[str, Any]) -> Dict[str, Any]:
    projects = {p["id"]: p["title"] for p in snapshot["projects"]}
    return dict(todo, project=projects.get(todo["project_id"]))


def _events_on(snapshot: Dict[str, Any], day: str) -> List[Dict[str, Any]]:
    out = []
    for e in snapshot.get("events", []):
        if e["start"][:10] <= day <= (e.get("end") or e["start"])[:10]:
            out.append(e)
    return sorted(out, key=lambda e: (not e["all_day"], e["start"]))


def today_view(snapshot: Dict[str, Any], today: date) -> Dict[str, Any]:
    day = today.isoformat()
    todos = [_decorate(snapshot, t) for t in snapshot["todos"]]
    open_ = [t for t in todos if not t["done"] and _is_planned(t)]
    scheduled = [t for t in open_ if t["start_date"] and t["start_date"] <= day]
    ids = {t["id"] for t in scheduled}
    due = [
        t for t in open_
        if t["deadline"] and t["deadline"] <= day and t["id"] not in ids
    ]
    done_today = [
        t for t in todos if t["done"] and (t["completed_at"] or "")[:10] == day
    ]
    return {
        "date": day,
        "num": today.day,
        "long_date": today.strftime("%A %-d %B"),
        "events": _events_on(snapshot, day),
        "morning": _by_order([t for t in scheduled if not t["evening"]]),
        "evening": _by_order([t for t in scheduled if t["evening"]]),
        "due": sorted(due, key=lambda t: t["deadline"]),
        "done": done_today,
    }


def _day_name(d: date, today: date) -> str:
    if d == today:
        return "Today"
    if d == today + timedelta(days=1):
        return "Tomorrow"
    return d.strftime("%A")


def week_start(today: date) -> date:
    return today - timedelta(days=today.weekday())  # Monday


def week_view(snapshot: Dict[str, Any], today: date) -> Dict[str, Any]:
    """The Monday-Sunday week containing `today`."""
    start = week_start(today)
    days = [start + timedelta(days=i) for i in range(7)]
    first, last = days[0].isoformat(), days[-1].isoformat()
    todos = [_decorate(snapshot, t) for t in snapshot["todos"] if not t["done"]]
    todos = [t for t in todos if _is_planned(t)]

    # Open items from before this week stay visible until handled.
    carried = [
        t for t in todos
        if (t["start_date"] and t["start_date"] < first)
        or (t["deadline"] and t["deadline"] < first)
    ]
    carried_ids = {t["id"] for t in carried}

    out_days = []
    for d in days:
        iso = d.isoformat()
        starting = [
            t for t in todos if t["start_date"] == iso and t["id"] not in carried_ids
        ]
        ids = {t["id"] for t in starting}
        deadlines = [t for t in todos if t["deadline"] == iso and t["id"] not in ids]
        out_days.append(
            {
                "date": iso,
                "label": d.strftime("%a %-d %b"),
                "num": d.day,
                "name": _day_name(d, today),
                "is_today": d == today,
                "todos": _by_order(starting),
                "deadlines": deadlines,
                "events": _events_on(snapshot, iso),
            }
        )
    return {"start": first, "end": last, "carried": carried, "days": out_days}


def group_by_heading(todos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Loose to-dos first, then each heading in Things order."""
    groups: Dict[Any, Dict[str, Any]] = {}
    for t in sorted(todos, key=lambda t: t["index"] or 0):
        g = groups.setdefault(
            t["heading"],
            {"heading": t["heading"], "order": t.get("heading_index") or 0, "todos": []},
        )
        g["todos"].append(t)
    return sorted(groups.values(), key=lambda g: (g["heading"] is not None, g["order"]))


def projects_view(snapshot: Dict[str, Any], today: date) -> List[Dict[str, Any]]:
    day = today.isoformat()
    out = []
    for p in snapshot["projects"]:
        mine = [t for t in snapshot["todos"] if t["project_id"] == p["id"]]
        open_ = [t for t in mine if not t["done"]]
        overdue = [t for t in open_ if t["deadline"] and t["deadline"] < day]
        pct = round(100 * p["completed"] / p["total"]) if p["total"] else 0
        out.append(
            dict(p, open=len(open_), overdue=len(overdue), percent=pct, todos=mine,
             groups=group_by_heading(mine))
        )
    return out
