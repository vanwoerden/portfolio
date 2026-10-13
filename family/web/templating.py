"""Jinja setup shared by the local app and the publisher.

`base` prefixes page links and `static_base` prefixes assets, so the same
templates work at the site root locally and under /family when published.
"""
from __future__ import annotations

import os
from datetime import date, datetime
from typing import Any

HERE = os.path.dirname(__file__)
TEMPLATES_DIR = os.path.join(HERE, "templates")
STATIC_DIR = os.path.join(HERE, "static")


def _fmt_day(iso: str) -> str:
    return date.fromisoformat(iso).strftime("%a %-d %b")


def _fmt_time(iso: str) -> str:
    return datetime.fromisoformat(iso).strftime("%H:%M")


def _fmt_localtime(iso: str) -> str:
    return datetime.fromisoformat(iso).astimezone().strftime("%a %H:%M")


def _asset_version(name: str) -> int:
    """Cache-buster so a rebuilt stylesheet is never served stale."""
    return int(os.path.getmtime(os.path.join(STATIC_DIR, name)))


def configure(env: Any, base: str = "", static_base: str = "/static") -> None:
    env.globals.update(base=base, static_base=static_base, asset_version=_asset_version)
    env.filters.update(day=_fmt_day, time=_fmt_time, localtime=_fmt_localtime)
