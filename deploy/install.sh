#!/bin/zsh
# Installs two launchd agents: the Things sync (watching) and the web server.
# Usage: deploy/install.sh [host]   (default host 127.0.0.1; use 0.0.0.0 for LAN access)
set -e
ROOT="${0:A:h:h}"
HOST="${1:-127.0.0.1}"
PY="$ROOT/.venv/bin/python"
AGENTS="$HOME/Library/LaunchAgents"
mkdir -p "$AGENTS" "$ROOT/data/logs"

write_agent() { # label, args...
  local label="$1"; shift
  local args=""; for a in "$@"; do args="$args<string>$a</string>"; done
  cat > "$AGENTS/$label.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>$label</string>
<key>ProgramArguments</key><array>$args</array>
<key>WorkingDirectory</key><string>$ROOT</string>
<key>EnvironmentVariables</key><dict><key>PYTHONUNBUFFERED</key><string>1</string></dict>
<key>RunAtLoad</key><true/>
<key>KeepAlive</key><true/>
<key>StandardOutPath</key><string>$ROOT/data/logs/$label.log</string>
<key>StandardErrorPath</key><string>$ROOT/data/logs/$label.log</string>
</dict></plist>
PLIST
  launchctl bootout "gui/$UID/$label" 2>/dev/null || true
  launchctl bootstrap "gui/$UID" "$AGENTS/$label.plist"
  launchctl kickstart -k "gui/$UID/$label"
  echo "installed $label"
}

write_agent local.things-home.sync "$PY" -m things_home.sync --watch 30
write_agent local.things-home.web "$PY" -m uvicorn web.app:app --host "$HOST" --port 8765
