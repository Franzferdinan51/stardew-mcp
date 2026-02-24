@echo off
REM Stardew MCP Quick Start - Build and Install Everything
REM This script builds the Go server, builds the C# mod, and installs the mod

echo ========================================
echo Stardew MCP - Quick Start
echo ========================================
echo.

REM Check for Go
where go >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Go is not installed or not in PATH
    echo Please install Go 1.23+ from https://go.dev/dl/
    exit /b 1
)

REM Check for .NET
where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: .NET SDK is not installed or not in PATH
    echo Please install .NET 6.0 SDK from https://dotnet.microsoft.com/download
    exit /b 1
)

echo [1/3] Checking Go version...
go version

echo [1/3] Building Go MCP Server...
cd /d "%~dp0..\mcp-server"
go build -o stardew-mcp.exe
if %errorlevel% neq 0 (
    echo ERROR: Go build failed
    exit /b 1
)
echo Go server built successfully!

echo [2/3] Building C# Mod...
cd /d "%~dp0..\mod\StardewMCP"
dotnet build -c Release
if %errorlevel% neq 0 (
    echo ERROR: C# build failed
    exit /b 1
)
echo C# mod built successfully!

echo [3/3] Installing mod to Stardew Valley...

REM Find Stardew Valley
set "STARDEV_DIR="

if exist "%ProgramFiles%\Stardew Valley\Stardew Valley.exe" set "STARDEV_DIR=%ProgramFiles%\Stardew Valley"
if exist "%ProgramFiles(x86)%\Stardew Valley\Stardew Valley.exe" set "STARDEV_DIR=%ProgramFiles(x86)%\Stardew Valley"
if exist "%LocalAppData%\StardewValley\Stardew Valley.exe" set "STARDEV_DIR=%LocalAppData%\StardewValley"

if "%STARDEV_DIR%"=="" (
    echo WARNING: Could not find Stardew Valley automatically.
    echo The mod has been built but not installed.
    echo.
    echo To install manually:
    echo 1. Find your Stardew Valley installation
    echo 2. Go to Mods folder
    echo 3. Create StardewMCP folder
    echo 4. Copy mod/StardewMCP/bin/Release/net6.0/* to that folder
    echo.
) else (
    set "MOD_DIR=%STARDEV_DIR%\Mods\StardewMCP"
    if not exist "%STARDEV_DIR%\Mods" mkdir "%STARDEV_DIR%\Mods"
    if not exist "%MOD_DIR%" mkdir "%MOD_DIR%"
    xcopy /E /Y "%~dp0..\mod\StardewMCP\bin\Release\net6.0\*" "%MOD_DIR%\" >nul
    copy /Y "%~dp0..\mod\StardewMCP\manifest.json" "%MOD_DIR%\" >nul
    echo Mod installed to: %MOD_DIR%
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start Stardew Valley through SMAPI
echo 2. Load your save file
echo 3. Run: cd setup ^&^& run.bat
echo.
echo ========================================
