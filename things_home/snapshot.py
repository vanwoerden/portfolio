"""Build and persist the snapshot the web app serves."""
from __future__ import annotations

import json
import os
import tempfile
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .reader import connect, read_home

DEFAULT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "snapshot.json")


def build(db_path: Optional[str] = None, events: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    conn = connect(db_path)
    try:
        data = read_home(conn)
    finally:
        conn.close()
    data["events"] = events or []
    data["generated_at"] = datetime.now(timezone.utc).isoformat()
    return data


def write(snapshot: Dict[str, Any], path: str = DEFAULT_PATH) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
    with os.fdopen(fd, "w") as f:
        json.dump(snapshot, f, indent=1)
    os.replace(tmp, path)  # atomic: readers never see a half-written file


def load(path: str = DEFAULT_PATH) -> Optional[Dict[str, Any]]:
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        return None
