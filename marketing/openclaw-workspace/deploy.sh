#!/bin/bash
# Culinary JEMs — OpenClaw Workspace Deployment
#
# Deploys workspace files to a dedicated OpenClaw instance.
# Run from the marketing/openclaw-workspace/ directory.
#
# Usage:
#   ./deploy.sh <host>    # e.g., ./deploy.sh 100.93.207.14
#   ./deploy.sh            # defaults to CT 101 (100.93.207.14)

set -euo pipefail

HOST="${1:-100.93.207.14}"
WORKSPACE_DIR="/root/.openclaw/workspace"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Culinary JEMs OpenClaw Workspace Deploy ==="
echo "Target: $HOST"
echo "Source: $SCRIPT_DIR"
echo ""

# Files to deploy as workspace root files
WORKSPACE_FILES=(
  "SOUL.md"
  "IDENTITY.md"
  "MEMORY.md"
)

# Files to deploy into references/
REFERENCE_FILES=(
  "content-templates.md"
  "graphic-specs.md"
)

# 1. Create directory structure
echo "1. Creating directory structure..."
ssh "root@$HOST" "mkdir -p $WORKSPACE_DIR/references"

# 2. Deploy workspace root files
echo "2. Deploying workspace files..."
for file in "${WORKSPACE_FILES[@]}"; do
  if [ -f "$SCRIPT_DIR/$file" ]; then
    scp "$SCRIPT_DIR/$file" "root@$HOST:$WORKSPACE_DIR/$file"
    echo "   ✓ $file"
  else
    echo "   ✗ $file (not found, skipping)"
  fi
done

# 3. Deploy reference files
echo "3. Deploying reference files..."
for file in "${REFERENCE_FILES[@]}"; do
  if [ -f "$SCRIPT_DIR/$file" ]; then
    scp "$SCRIPT_DIR/$file" "root@$HOST:$WORKSPACE_DIR/references/$file"
    echo "   ✓ references/$file"
  else
    echo "   ✗ references/$file (not found, skipping)"
  fi
done

# 4. Verify openclaw.json exists and has required settings
echo "4. Checking openclaw.json..."
ssh "root@$HOST" "cat /root/.openclaw/openclaw.json 2>/dev/null" | head -5 || echo "   ⚠ No openclaw.json found — create one before starting gateway"

# 5. Restart gateway to pick up workspace changes
echo ""
echo "5. Restarting OpenClaw gateway..."
ssh "root@$HOST" "pkill -f 'openclaw gateway' 2>/dev/null || true; sleep 2; nohup openclaw gateway --force --port 18789 >> /var/log/openclaw-gateway.log 2>&1 &"
sleep 3

# 6. Health check
echo "6. Health check..."
if curl -sf "http://$HOST:18789/v1/models" -H "Authorization: Bearer \$OPENCLAW_TOKEN" > /dev/null 2>&1; then
  echo "   ✓ Gateway responding on port 18789"
else
  echo "   ⚠ Gateway not responding yet — may still be starting up"
  echo "   Check: ssh root@$HOST 'tail -20 /var/log/openclaw-gateway.log'"
fi

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Workspace files at: $HOST:$WORKSPACE_DIR/"
echo "Test with:"
echo "  curl http://$HOST:18789/v1/chat/completions \\"
echo "    -H 'Authorization: Bearer <token>' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"model\":\"default\",\"messages\":[{\"role\":\"user\",\"content\":\"Write a Menu Spotlight caption for The Fat Sam\"}]}'"
