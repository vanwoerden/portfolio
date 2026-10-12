"""Calendar events for every calendar Things hasn't disabled (via EventKit)."""
from __future__ import annotations

import json
import os
import plistlib
import shutil
import subprocess
import tempfile
from typing import Any, Dict, List, Set

ROOT = os.path.dirname(os.path.dirname(__file__))
SOURCE = os.path.join(ROOT, "tools", "events.swift")
INFO_PLIST = os.path.join(ROOT, "tools", "Info.plist")
APP = os.path.join(ROOT, "build", "ThingsHomeEvents.app")
PREFS = os.path.expanduser(
    "~/Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/"
    "Library/Preferences/JLMPQHK86H.com.culturedcode.ThingsMac.plist"
)


def build_helper() -> None:
    """Build build/ThingsHomeEvents.app. It must be an app bundle with its own
    identity: a bare CLI inherits the launching app's (denied) calendar access."""
    exe = os.path.join(APP, "Contents", "MacOS", "events")
    if os.path.exists(exe) and os.path.getmtime(exe) >= os.path.getmtime(SOURCE):
        return
    os.makedirs(os.path.dirname(exe), exist_ok=True)
    subprocess.run(["swiftc", "-O", SOURCE, "-o", exe], check=True)
    shutil.copy(INFO_PLIST, os.path.join(APP, "Contents", "Info.plist"))
    subprocess.run(["codesign", "--force", "--sign", "-", APP], check=True)


def things_calendar_prefs(path: str = PREFS) -> Dict[str, Any]:
    with open(path, "rb") as f:
        prefs = plistlib.load(f)
    disabled = {
        h.get("localCalendarIdentifier")
        for h in prefs.get("disabledCalendarEventsCalendarHints", [])
    }
    return {"enabled": bool(prefs.get("calendarEventsEnabled")), "disabled": disabled}


def filter_events(raw: List[Dict[str, Any]], disabled: Set[str]) -> List[Dict[str, Any]]:
    return [e for e in raw if e["calendar_id"] not in disabled]


def fetch(days_back: int = 7, days_forward: int = 21) -> List[Dict[str, Any]]:
    prefs = things_calendar_prefs()
    if not prefs["enabled"]:
        return []
    build_helper()
    with tempfile.TemporaryDirectory() as tmp:
        out, err = os.path.join(tmp, "out.json"), os.path.join(tmp, "err.txt")
        # `open` launches the app as its own process, so macOS attributes the
        # calendar permission to it (and may show the prompt on first run).
        subprocess.run(
            ["open", "-W", "-n", "--stdout", out, "--stderr", err, APP,
             "--args", str(days_back), str(days_forward)],
            check=True, timeout=120,
        )
        if os.path.getsize(err) if os.path.exists(err) else 0:
            raise RuntimeError("events helper failed: %s" % open(err).read().strip())
        with open(out) as f:
            return filter_events(json.load(f), prefs["disabled"])
