#!/bin/zsh
for l in local.things-home.sync local.things-home.web; do
  launchctl bootout "gui/$UID/$l" 2>/dev/null || true
  rm -f "$HOME/Library/LaunchAgents/$l.plist"; echo "removed $l"
done
