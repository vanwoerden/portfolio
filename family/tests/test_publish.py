import re
from datetime import date

from things_home import publish

TODAY = date(2026, 10, 14)


def snapshot():
    return {
        "generated_at": "2026-10-14T12:00:00+00:00",
        "projects": [{"id": "p1", "title": "Kids", "notes": "", "done": False, "deadline": None,
                      "index": 0, "total": 1, "completed": 0, "tags": []}],
        "todos": [{"id": "t1", "title": "Secret task", "notes": "", "done": False, "project_id": "p1",
                   "heading": None, "heading_index": None, "start": "anytime", "start_date": "2026-10-14",
                   "deadline": None, "evening": False, "today_index": 0, "index": 0, "completed_at": None,
                   "tags": [], "checklist": []}],
        "events": [{"id": "e1", "title": "Dentist", "all_day": False, "calendar": "Family",
                    "start": "2026-10-14T09:00:00-04:00", "end": "2026-10-14T10:00:00-04:00"}],
    }


def test_bundle_has_pages_per_viewer_date():
    b = publish.render_bundle(snapshot(), TODAY)
    assert b["dates"][0] == "2026-10-13" and b["dates"][-1] == "2026-10-28"
    for d in b["dates"]:
        assert "today/" + d in b["pages"] and "week/" + d in b["pages"]
    assert "projects" in b["pages"] and "project/p1" in b["pages"]


def test_pages_use_family_base_and_only_pages_hold_data():
    b = publish.render_bundle(snapshot(), TODAY)
    for html in b["pages"].values():
        assert "/family/web/static/carbon.css" in html
        assert not re.search(r'(href|src)="/(?!family)', html)
    assert "Secret task" in b["pages"]["today/2026-10-14"]
    assert "Dentist" in b["pages"]["today/2026-10-14"]
    assert "Today" in b["pages"]["week/2026-10-14"]


def test_digest_ignores_timestamp_but_not_data_or_day():
    a, b = snapshot(), snapshot()
    b["generated_at"] = "2026-10-14T13:00:00+00:00"
    assert publish.digest(a, TODAY) == publish.digest(b, TODAY)
    b["todos"][0]["title"] = "Changed"
    assert publish.digest(a, TODAY) != publish.digest(b, TODAY)
    assert publish.digest(a, TODAY) != publish.digest(a, date(2026, 10, 15))


def test_needs_upload_on_change_or_heartbeat():
    assert publish.needs_upload({}, "x", 0)
    assert not publish.needs_upload({"digest": "x", "uploaded_at": 1000}, "x", 1100)
    assert publish.needs_upload({"digest": "x", "uploaded_at": 1000}, "x", 1000 + publish.HEARTBEAT_SECONDS)
    assert publish.needs_upload({"digest": "x", "uploaded_at": 1000}, "y", 1100)


def test_publish_disabled_without_secret(tmp_path, monkeypatch):
    monkeypatch.setattr(publish, "ENV_FILE", str(tmp_path / "missing.env"))
    assert publish.publish(snapshot(), TODAY, 0).startswith("publish disabled")


def test_publish_uploads_then_skips_when_unchanged(tmp_path, monkeypatch):
    env = tmp_path / ".env"
    env.write_text("FAMILY_INGEST_SECRET=s3cret\nSITE_URL=https://example.test\n")
    monkeypatch.setattr(publish, "ENV_FILE", str(env))
    monkeypatch.setattr(publish, "STATE_PATH", str(tmp_path / "state.json"))
    sent = []
    monkeypatch.setattr(publish, "upload", lambda bundle, url, secret: sent.append((url, secret, len(bundle["pages"]))))
    assert publish.publish(snapshot(), TODAY, 0).startswith("published")
    assert sent[0][:2] == ("https://example.test", "s3cret")
    assert publish.publish(snapshot(), TODAY, 60) == "publish skipped (unchanged)"
    assert len(sent) == 1
