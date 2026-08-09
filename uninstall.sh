#!/bin/bash

echo "Uninstalling pdfilter..."

if command -v pipx &> /dev/null; then
    # Check if pdfilter is managed by pipx
    if pipx list 2>/dev/null | grep -q "pdfilter"; then
        echo "Uninstalling via pipx..."
        pipx uninstall pdfilter
        echo "✅ Successfully uninstalled pdfilter!"
        exit 0
    fi
fi

if command -v pip3 &> /dev/null; then
    echo "Attempting to uninstall via pip3..."
    pip3 uninstall -y pdfilter
    echo "✅ Successfully uninstalled pdfilter!"
    exit 0
fi

echo "❌ Could not find pipx or pip3 to uninstall pdfilter, or it wasn't installed."
exit 1
