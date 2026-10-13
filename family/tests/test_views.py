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
        todo("f", start="someday", start_date="2026-10-14"),  # scheduled for today
        todo("h", start="someday"),  # genuinely unscheduled
        todo("g", done=True, completed_at="2026-10-14T08:00:00+00:00"),
    ])
    v = views.today_view(s, TODAY)
    assert {t["id"] for t in v["morning"]} == {"a", "b", "f"}
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


def test_completed_in_the_evening_counts_as_done_today(monkeypatch):
    import os
    import time

    monkeypatch.setenv("TZ", "America/New_York")
    time.tzset()
    try:
        # 2026-10-12 20:47 EDT == 2026-10-13 00:47 UTC
        ts = 1791852472
        stamp = reader.decode_ts(ts)
        assert stamp.startswith("2026-10-12T20:47")
        s = snap([todo("g", done=True, completed_at=stamp)])
        assert [t["id"] for t in views.today_view(s, date(2026, 10, 12))["done"]] == ["g"]
    finally:
        monkeypatch.undo()
        time.tzset()


def test_project_groups_mix_loose_and_headed_todos():
    s = snap([
        todo("a", heading="Later", heading_index=2, index=1),
        todo("b", heading=None, index=5),
        todo("c", heading="Now", heading_index=1, index=3),
        todo("d", heading="Later", heading_index=2, index=0),
    ])
    groups = views.projects_view(s, TODAY)[0]["groups"]
    assert [g["heading"] for g in groups] == [None, "Now", "Later"]
    assert [t["id"] for t in groups[2]["todos"]] == ["d", "a"]


def test_future_scheduled_todos_are_someday_with_a_date():
    # Things stores "scheduled for Tuesday" as start=someday + startDate.
    s = snap([
        todo("a", start="someday", start_date="2026-10-15"),
        todo("b", start="someday"),
    ])
    v = views.week_view(s, TODAY)
    by_day = {d["date"]: d for d in v["days"]}
    assert [t["id"] for t in by_day["2026-10-15"]["todos"]] == ["a"]
    assert all(t["id"] != "b" for d in v["days"] for t in d["todos"])
    assert views.today_view(s, TODAY)["morning"] == []


def test_week_day_titles_are_number_and_name():
    days = views.week_view(snap([]), TODAY)["days"]  # Wednesday 14th
    assert [(d["num"], d["name"]) for d in days] == [
        (12, "Monday"), (13, "Tuesday"), (14, "Today"), (15, "Tomorrow"),
        (16, "Friday"), (17, "Saturday"), (18, "Sunday"),
    ]


def test_today_view_has_number_and_long_date():
    v = views.today_view(snap([]), TODAY)
    assert v["num"] == 14 and v["long_date"] == "Wednesday 14 October"
