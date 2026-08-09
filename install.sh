#!/bin/bash
set -e

echo "Installing pdfilter..."

if command -v pipx &> /dev/null; then
    echo "Using pipx to install pdfilter (Recommended)..."
    pipx install . --force
    echo "✅ Successfully installed! You can now run 'pdfilter' from anywhere."
    exit 0
fi

if command -v pip3 &> /dev/null; then
    echo "⚠️  'pipx' is not installed. Falling back to 'pip3 install --user'..."
    echo "Note: On modern Debian/Ubuntu systems, this might fail. We highly recommend running 'sudo apt install pipx' first."
    pip3 install --user .
    echo "✅ Successfully installed!"
    echo "Make sure ~/.local/bin is in your PATH to use the 'pdfilter' command."
    exit 0
fi

echo "❌ Error: Neither pipx nor pip3 is installed. Please install python3-pip or pipx and try again."
exit 1
