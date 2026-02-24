#!/bin/bash
# Stardew MCP Mod Installer for Linux/Mac

echo "========================================"
echo "Stardew MCP - Mod Installer"
echo "========================================"
echo ""

# Check for .NET
if ! command -v dotnet &> /dev/null; then
    echo "ERROR: .NET SDK not found"
    echo "Please install .NET 6.0 SDK from https://dotnet.microsoft.com/download"
    exit 1
fi

# Find Stardew Valley (common Linux paths)
STARDEW_DIR=""

# Check common paths
if [ -f "$HOME/.local/share/Steam/steamapps/common/Stardew Valley/Stardew Valley.exe" ]; then
    STARDEW_DIR="$HOME/.local/share/Steam/steamapps/common/Stardew Valley"
elif [ -f "$HOME/.steam/steamapps/common/Stardew Valley/Stardew Valley.exe" ]; then
    STARDEW_DIR="$HOME/.steam/steamapps/common/Stardew Valley"
fi

# If not found, ask user
if [ -z "$STARDEW_DIR" ]; then
    echo "Stardew Valley not found in common locations."
    echo "Please enter your Stardew Valley installation path:"
    read -r STARDEW_DIR
fi

# Check if path exists
if [ ! -f "$STARDEW_DIR/Stardew Valley.exe" ]; then
    echo "ERROR: Stardew Valley not found at $STARDEW_DIR"
    exit 1
fi

echo "Found Stardew Valley at: $STARDEW_DIR"

# Set up mod paths
MODS_DIR="$STARDEW_DIR/Mods"

# Check for SMAPI
if [ -f "$STARDEW_DIR/smapi.sh" ]; then
    echo "SMAPI found!"
else
    echo "WARNING: SMAPI not detected. Please install SMAPI first!"
    echo "Download from: https://smapi.io/"
    echo ""
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        exit 1
    fi
fi

# Create Mods directory if needed
mkdir -p "$MODS_DIR"

# Build the C# mod
echo ""
echo "[1/2] Building C# mod..."
cd "$(dirname "$0")/../mod/StardewMCP"

dotnet build -c Release
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

# Copy mod files
echo ""
echo "[2/2] Installing mod to Stardew Valley..."
MOD_INSTALL_DIR="$MODS_DIR/StardewMCP"

mkdir -p "$MOD_INSTALL_DIR"

# Copy all files from bin/Release
cp -r "$(dirname "$0")/../mod/StardewMCP/bin/Release/net6.0/"* "$MOD_INSTALL_DIR/"

# Copy manifest if not in bin
if [ ! -f "$MOD_INSTALL_DIR/manifest.json" ]; then
    cp "$(dirname "$0")/../mod/StardewMCP/manifest.json" "$MOD_INSTALL_DIR/"
fi

echo ""
echo "========================================"
echo "Mod installed successfully!"
echo "========================================"
echo ""
echo "Location: $MOD_INSTALL_DIR"
echo ""
echo "Next steps:"
echo "1. Start Stardew Valley with SMAPI"
echo "2. Load your save file"
echo "3. Run the MCP server: cd setup && ./run.sh"
echo "========================================"
