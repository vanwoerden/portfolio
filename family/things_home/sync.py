"""CLI: python -m things_home.sync [--watch SECONDS]"""
from __future__ import annotations

import argparse
import os
import time

from . import events, publish, snapshot
from .reader import find_database


REFRESH_SECONDS = 300


def _mtime(db: str) -> float:
    return max(os.path.getmtime(p) for p in (db, db + "-wal") if os.path.exists(p))


def run_once() -> None:
    try:
        evs = events.fetch()
    except Exception as exc:  # calendar access is optional; never block the task sync
        print("warning: calendar events unavailable: %s" % exc)
        evs = []
    snap = snapshot.build(events=evs)
    snapshot.write(snap)
    print(publish.publish(snap))
    print("synced: %d projects, %d to-dos, %d events"
          % (len(snap["projects"]), len(snap["todos"]), len(snap["events"])))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--watch", type=int, metavar="SECONDS", help="re-sync when Things changes")
    args = ap.parse_args()
    run_once()
    if args.watch:
        db = find_database()
        seen, last_run = _mtime(db), time.time()
        while True:
            time.sleep(args.watch)
            current = _mtime(db)
            # Calendar changes don't touch the Things DB, so also refresh periodically.
            if current != seen or time.time() - last_run >= REFRESH_SECONDS:
                seen, last_run = current, time.time()
                run_once()


if __name__ == "__main__":
    main()
