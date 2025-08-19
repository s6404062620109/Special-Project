#!/usr/bin/env bash
set -euo pipefail

# Trojan Horse Lab (Terminal) — SAFE SIMULATION ONLY
# This script prepares a small workspace that mimics a "legit installer" vs a "trojanized installer".
# No malicious actions will be performed. Everything is text-only.

WORKDIR="workspace"
mkdir -p "$WORKDIR/packages"
rm -rf "$WORKDIR/packages"/*
touch "$WORKDIR/.log"

# Create a clearly safe installer
cat > "$WORKDIR/packages/safe_app.sh" <<'EOF'
#!/usr/bin/env bash
echo "[SafeApp] Installing core files..."
# No elevated privileges requested, no strange network calls.
echo "[SafeApp] Done."
EOF
chmod +x "$WORKDIR/packages/safe_app.sh"

# Create a suspicious "trojanized" installer
cat > "$WORKDIR/packages/free-gift-installer.sh" <<'EOF'
#!/usr/bin/env bash
echo "[GiftInstaller] Unpacking bonus content..."
# --- Suspicious behaviors below (simulation only) ---
echo "[GiftInstaller] Requesting admin privileges..."  # (simulated)
echo "[GiftInstaller] Adding autorun to startup..."     # (simulated)
echo "[GiftInstaller] Contacting remote server..."      # (simulated)
# Hidden payload (still simulation, just echoes/creates a file)
PAYLOAD_DIR="$HOME/.config/.sys-updater"
mkdir -p "$PAYLOAD_DIR"
echo "TROJAN_PAYLOAD_ACTIVE=true" > "$PAYLOAD_DIR/config"
echo "BACKDOOR_PORT=4444" >> "$PAYLOAD_DIR/config"

# Embedded indicator and flag are appended at the end of this file for learners to find.
# Learners can use: grep -n "TROJAN_\|BACKDOOR_PORT" -nR workspace/packages/
# Or: strings workspace/packages/free-gift-installer.sh | tail -n 3
# FLAG lives in the file content itself for read-only discovery.
echo "[GiftInstaller] Install complete."
EOF
chmod +x "$WORKDIR/packages/free-gift-installer.sh"

# Append fake signature + FLAG to the suspicious installer to simulate discovery
printf "\n# INDICATOR:TROJAN\n# BACKDOOR_PORT=4444\n# FLAG{TROJAN_BACKDOOR_FOUND}\n" >> "$WORKDIR/packages/free-gift-installer.sh"

cat > "$WORKDIR/README.md" <<'EOF'
# Trojan Horse Lab (Terminal)

## Objective
Find which installer is a Trojan and retrieve the FLAG.

## What was created
- `workspace/packages/safe_app.sh` — looks clean.
- `workspace/packages/free-gift-installer.sh` — looks like a normal gift installer but embeds suspicious bits.

## Hints
- Search for suspicious strings across files:
  ```bash
  grep -a -R "TROJAN\|BACKDOOR_PORT\|FLAG{" workspace/packages/
  ```

- Or inspect the suspicious file’s printable text:
  ```bash
  strings workspace/packages/free-gift-installer.sh | tail -n 5
  ```

## Expected answer
- The Trojan file is: `workspace/packages/free-gift-installer.sh`
- The FLAG you should submit is: `FLAG{TROJAN_BACKDOOR_FOUND}`

*This is a safe simulation. No real malware, privileges, or network actions are performed.*
EOF

echo "✅ Trojan Horse (Terminal) workspace created in $WORKDIR"
