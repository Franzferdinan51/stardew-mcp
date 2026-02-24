#!/bin/bash
# Stardew MCP Quick Start - Build and Install Everything

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================"
echo "Stardew MCP - Quick Start"
echo "========================================"
echo ""

# Check for Go
if ! command -v go &> /dev/null; then
    echo "ERROR: Go is not installed or not in PATH"
    echo "Please install Go 1.23+ from https://go.dev/dl/"
    exit 1
fi

# Check for .NET
if ! command -v dotnet &> /dev/null; then
    echo "ERROR: .NET SDK is not installed or not in PATH"
    echo "Please install .NET 6.0 SDK from https://dotnet.microsoft.com/download"
    exit 1
fi

echo "[1/3] Checking Go version..."
go version
echo ""

echo "[1/3] Building Go MCP Server..."
cd "$SCRIPT_DIR/../mcp-server"
go build -o stardew-mcp
if [ $? -ne 0 ]; then
    echo "ERROR: Go build failed"
    exit 1
fi
echo "Go server built successfully!"
echo ""

echo "[2/3] Building C# Mod..."
cd "$SCRIPT_DIR/../mod/StardewMCP"
dotnet build -c Release
if [ $? -ne 0 ]; then
    echo "ERROR: C# build failed"
    exit 1
fi
echo "C# mod built successfully!"
echo ""

echo "[3/3] Checking for Stardew Valley..."

# Find Stardew Valley
STARDEW_DIR=""

if [ -f "$HOME/.local/share/Steam/steamapps/common/Stardew Valley/Stardew Valley.exe" ]; then
    STARDEW_DIR="$HOME/.local/share/Steam/steamapps/common/Stardew Valley"
elif [ -f "$HOME/.steam/steamapps/common/Stardew Valley/Stardew Valley.exe" ]; then
    STARDEW_DIR="$HOME/.steam/steamapps/common/Stardew Valley"
fi

if [ -z "$STARDEW_DIR" ]; then
    echo "WARNING: Could not find Stardew Valley automatically."
    echo "The mod has been built but not installed."
    echo ""
    echo "To install manually:"
    echo "1. Find your Stardew Valley installation"
    echo "2. Go to Mods folder"
    echo "3. Create StardewMCP folder"
    echo "4. Copy mod/StardewMCP/bin/Release/net6.0/* to that folder"
    echo ""
else
    MOD_DIR="$STARDEW_DIR/Mods/StardewMCP"
    mkdir -p "$MOD_DIR"
    cp -r "$SCRIPT_DIR/../mod/StardewMCP/bin/Release/net6.0/"* "$MOD_DIR/"
    cp "$SCRIPT_DIR/../mod/StardewMCP/manifest.json" "$MOD_DIR/"
    echo "Mod installed to: $MOD_DIR"
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Start Stardew Valley through SMAPI"
echo "2. Load your save file"
echo "3. Run: cd setup && ./run.sh"
echo ""
echo "========================================"
