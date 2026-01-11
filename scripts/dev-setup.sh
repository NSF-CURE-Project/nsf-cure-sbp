#!/usr/bin/env bash
set -euo pipefail

HOST_ENTRY="127.0.0.1 preview.sbp.local app.sbp.local admin.sbp.local"
HOSTS_FILE="/etc/hosts"

if grep -q "preview.sbp.local" "$HOSTS_FILE" && grep -q "app.sbp.local" "$HOSTS_FILE" && grep -q "admin.sbp.local" "$HOSTS_FILE"; then
  echo "preview.sbp.local, app.sbp.local, and admin.sbp.local already present in $HOSTS_FILE"
  exit 0
fi

echo "Adding preview.sbp.local, app.sbp.local, and admin.sbp.local to $HOSTS_FILE (requires sudo)..."
sudo sh -c "printf '\n$HOST_ENTRY\n' >> $HOSTS_FILE"
echo "Done."
echo "If admin/app sessions feel mixed, clear cookies for admin.sbp.local and app.sbp.local in your browser."
