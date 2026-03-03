#!/usr/bin/env bash
set -euo pipefail

HOSTS_FILE="/etc/hosts"
HOSTS=(
  "preview.sbp.local"
  "app.sbp.local"
  "admin.sbp.local"
  "api.sbp.local"
)
MISSING_HOSTS=()

for host in "${HOSTS[@]}"; do
  if ! grep -qE "(^|[[:space:]])${host}([[:space:]]|$)" "$HOSTS_FILE"; then
    MISSING_HOSTS+=("$host")
  fi
done

if [ "${#MISSING_HOSTS[@]}" -eq 0 ]; then
  echo "preview.sbp.local, app.sbp.local, admin.sbp.local, and api.sbp.local already present in $HOSTS_FILE"
  exit 0
fi

HOST_ENTRY="127.0.0.1 ${MISSING_HOSTS[*]}"

echo "Adding ${MISSING_HOSTS[*]} to $HOSTS_FILE (requires sudo)..."
sudo sh -c "printf '\n$HOST_ENTRY\n' >> $HOSTS_FILE"
echo "Done."
echo "If admin/app sessions feel mixed, clear cookies for admin.sbp.local and app.sbp.local in your browser."
