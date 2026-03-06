#!/bin/bash
# Checks if the kalshi-mcp validate-order.js patch is applied

VALIDATE_FILE=$(find ~/.npm/_npx -path "*/kalshi-core/dist/validate-order.js" 2>/dev/null | head -1)

if [ -z "$VALIDATE_FILE" ]; then
    echo "NOT INSTALLED: validate-order.js not found in npx cache"
    exit 1
fi

echo "File: $VALIDATE_FILE"

if grep -q 'status !== "active"' "$VALIDATE_FILE"; then
    echo "STATUS: PATCHED"
else
    echo "STATUS: UNPATCHED - run patch-kalshi-mcp.sh"
fi

# Show the relevant lines
echo ""
echo "Current validation logic:"
grep -n -A2 "Check market is open" "$VALIDATE_FILE"
