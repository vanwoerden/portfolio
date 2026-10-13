# Things home web app

## Style rules
- Never use all caps. Always use sentence case, in the UI, docs, comments, commit messages and everything else.
  That means no `text-transform: uppercase`, no all-caps labels, and no shouting headings.

## Project notes
- Read-only web app for the Things 3 "Home" area: `things_home/` (reader, views, sync, events) and `web/` (FastAPI + Jinja).
- UI uses IBM Carbon. Source is in `frontend/`, built output in `web/static/carbon.css`. Rebuild with `cd frontend && npm run build`.
- Run tests with `.venv/bin/python -m pytest -q`.
