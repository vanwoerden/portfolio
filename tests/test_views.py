from datetime import date

from things_home import events, reader, views


def todo(id, **kw):
    base = dict(id=id, title=id, notes="", done=False, project_id="p1", heading=None,
                start="anytime", start_date=None, deadline=None, evening=False,
                today_index=0, index=0, completed_at=None, tags=[], checklist=[])
    base.update(kw)
    return base


def snap(todos, evs=()):
    return {"projects": [{"id": "p1", "title": "P", "completed": 1, "total": 4, "deadline": None,
                          "index": 0, "notes": "", "done": False, "tags": []}],
            "todos": todos, "events": list(evs)}


TODAY = date(2026, 10, 14)  # Wednesday


def test_decode_date():
    assert reader.decode_date(132818432) == "2026-10-12"
    assert reader.decode_date(None) is None


def test_today_sections():
    s = snap([
        todo("a", start_date="2026-10-14"),
        todo("b", start_date="2026-10-10"),
        todo("c", start_date="2026-10-14", evening=True),
        todo("d", deadline="2026-10-13"),
        todo("e", start_date="2026-10-15"),
        todo("f", start="someday", start_date="2026-10-14"),
        todo("g", done=True, completed_at="2026-10-14T08:00:00+00:00"),
    ])
    v = views.today_view(s, TODAY)
    assert {t["id"] for t in v["morning"]} == {"a", "b"}
    assert [t["id"] for t in v["evening"]] == ["c"]
    assert [t["id"] for t in v["due"]] == ["d"]
    assert [t["id"] for t in v["done"]] == ["g"]


def test_week_is_monday_to_sunday_and_carries_overdue():
    s = snap([
        todo("a", start_date="2026-10-12"),
        todo("b", deadline="2026-10-18"),
        todo("c", start_date="2026-10-05"),
        todo("d", start_date="2026-10-19"),
    ], [{"id": "e", "title": "Dentist", "all_day": False,
         "start": "2026-10-16T09:00:00+02:00", "end": "2026-10-16T10:00:00+02:00", "calendar": "x"}])
    v = views.week_view(s, TODAY)
    assert v["start"] == "2026-10-12" and v["end"] == "2026-10-18"
    assert [t["id"] for t in v["carried"]] == ["c"]
    by_day = {d["date"]: d for d in v["days"]}
    assert [t["id"] for t in by_day["2026-10-12"]["todos"]] == ["a"]
    assert [t["id"] for t in by_day["2026-10-18"]["deadlines"]] == ["b"]
    assert by_day["2026-10-16"]["events"][0]["title"] == "Dentist"
    assert by_day["2026-10-14"]["is_today"]
    assert all(t["id"] != "d" for day in v["days"] for t in day["todos"])


def test_projects_progress():
    s = snap([todo("a", done=True), todo("b", deadline="2026-10-01")])
    p = views.projects_view(s, TODAY)[0]
    assert p["percent"] == 25 and p["open"] == 1 and p["overdue"] == 1


def test_disabled_calendars_filtered():
    raw = [{"calendar_id": "x"}, {"calendar_id": "y"}]
    assert events.filter_events(raw, {"x"}) == [{"calendar_id": "y"}]
