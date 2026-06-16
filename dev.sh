#!/usr/bin/env bash
# Starts the Phonebook backend and frontend dev servers.
# Tries to open each in its own terminal window; otherwise runs both in this
# terminal and stops them together on Ctrl-C.
#
# Usage:  ./dev.sh   (from the repo root)

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
server_dir="$root/server"
client_dir="$root/client"

echo "Starting Phonebook dev servers..."

case "$(uname -s)" in
  MINGW* | MSYS* | CYGWIN*)
    # Windows (Git Bash): open separate cmd windows.
    cmd.exe /c start "Phonebook API" cmd /k "cd /d \"$(cygpath -w "$server_dir")\" && npm run dev"
    cmd.exe /c start "Phonebook Web" cmd /k "cd /d \"$(cygpath -w "$client_dir")\" && npm run dev"
    echo "  backend  -> http://localhost:3001  (new window)"
    echo "  frontend -> http://localhost:5173  (new window)"
    exit 0
    ;;
  Darwin*)
    # macOS: open separate Terminal windows.
    osascript -e "tell application \"Terminal\" to do script \"cd '$server_dir' && npm run dev\"" >/dev/null
    osascript -e "tell application \"Terminal\" to do script \"cd '$client_dir' && npm run dev\"" >/dev/null
    echo "  backend  -> http://localhost:3001  (new window)"
    echo "  frontend -> http://localhost:5173  (new window)"
    exit 0
    ;;
esac

# Linux / fallback: try a graphical terminal, else run both here.
if command -v gnome-terminal >/dev/null 2>&1; then
  gnome-terminal --working-directory="$server_dir" -- bash -c "npm run dev; exec bash"
  gnome-terminal --working-directory="$client_dir" -- bash -c "npm run dev; exec bash"
  echo "  backend  -> http://localhost:3001  (new window)"
  echo "  frontend -> http://localhost:5173  (new window)"
  exit 0
fi

echo "  No separate-terminal launcher found; running both here (Ctrl-C stops both)."
( cd "$server_dir" && npm run dev ) &
server_pid=$!
( cd "$client_dir" && npm run dev ) &
client_pid=$!

trap 'kill "$server_pid" "$client_pid" 2>/dev/null' INT TERM
wait
