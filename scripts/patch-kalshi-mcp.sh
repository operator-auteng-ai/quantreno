#!/bin/bash
# Patches the @newyorkcompute/kalshi-mcp validate-order.js bug
# The package checks for status === "open" but Kalshi API returns "active" for tradeable markets
# Run this after any npx cache reset or package update

set -e

echo "Searching for validate-order.js in npx cache..."

VALIDATE_FILE=$(find ~/.npm/_npx -path "*/kalshi-core/dist/validate-order.js" 2>/dev/null | head -1)

if [ -z "$VALIDATE_FILE" ]; then
    echo "ERROR: validate-order.js not found. Is @newyorkcompute/kalshi-mcp installed?"
    echo "Try running: npx -y @newyorkcompute/kalshi-mcp --help"
    exit 1
fi

echo "Found: $VALIDATE_FILE"

# Check if already patched
if grep -q 'status !== "active"' "$VALIDATE_FILE"; then
    echo "Already patched! No changes needed."
    exit 0
fi

# Check if the bug exists
if ! grep -q 'market.status?.toLowerCase() !== "open"' "$VALIDATE_FILE"; then
    echo "WARNING: Expected bug pattern not found. The package may have been updated."
    echo "Check the file manually: $VALIDATE_FILE"
    exit 1
fi

# Apply the patch
echo "Applying patch..."
sed -i.bak 's|// Check market is open\n.*if (market.status?.toLowerCase() !== "open")|// Check market is open (Kalshi API returns "active" for tradeable markets)\n        const status = market.status?.toLowerCase();\n        if (status !== "open" \&\& status !== "active")|' "$VALIDATE_FILE"

# If sed multiline didn't work, use a simpler approach
if ! grep -q 'status !== "active"' "$VALIDATE_FILE"; then
    echo "Multiline sed failed, using line-by-line approach..."
    cp "$VALIDATE_FILE.bak" "$VALIDATE_FILE"

    python3 -c "
import re
with open('$VALIDATE_FILE', 'r') as f:
    content = f.read()

old = '''        // Check market is open
        if (market.status?.toLowerCase() !== \"open\") {
            errors.push(\`Market \${input.ticker} is \${market.status}, not open for trading\`);
        }'''

new = '''        // Check market is open (Kalshi API returns \"active\" for tradeable markets)
        const status = market.status?.toLowerCase();
        if (status !== \"open\" && status !== \"active\") {
            errors.push(\`Market \${input.ticker} is \${market.status}, not open for trading\`);
        }'''

content = content.replace(old, new)
with open('$VALIDATE_FILE', 'w') as f:
    f.write(content)
"
fi

# Verify
if grep -q 'status !== "active"' "$VALIDATE_FILE"; then
    echo "Patch applied successfully!"
    echo "NOTE: Restart the MCP server / Claude Code for changes to take effect."
    rm -f "$VALIDATE_FILE.bak"
else
    echo "ERROR: Patch verification failed."
    if [ -f "$VALIDATE_FILE.bak" ]; then
        mv "$VALIDATE_FILE.bak" "$VALIDATE_FILE"
        echo "Restored backup."
    fi
    exit 1
fi
