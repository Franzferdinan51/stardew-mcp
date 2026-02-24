@echo off
REM Stardew MCP Server - Remote Bot Mode
REM This runs the server that remote AI agents can connect to
REM Usage: run-remote.bat [port]

setlocal enabledelayedexpansion

set PORT=%1
if "%PORT%"=="" set PORT=8765

echo ========================================
echo   Stardew MCP - Remote Server Mode
echo ========================================
echo.

REM Change to mcp-server directory
cd /d "%~dp0..\mcp-server" 2>nul
if errorlevel 1 (
    echo ERROR: Could not change to mcp-server directory
    exit /b 1
)

REM Check if executable exists
if not exist "stardew-mcp.exe" (
    echo ERROR: stardew-mcp.exe not found
    echo.
    echo Please run setup.bat first:
    echo   cd setup
    echo   setup.bat
    echo.
    exit /b 1
)

REM Get local IP address for display
setlocal enabledelayedexpansion
set "local_ip=localhost"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=*" %%b in ("%%a") do (
        if not "%%b"=="" (
            set "local_ip=%%b"
        )
    )
)
set "local_ip=%local_ip:~1%"

echo Starting Stardew MCP Server in REMOTE MODE...
echo.
echo Remote agents can connect to:
echo   Local:   ws://localhost:%PORT%/mcp
echo   Network: ws://%local_ip%:%PORT%/mcp
echo.
echo ========================================
echo IMPORTANT: Firewall Configuration
echo ========================================
echo   - Windows Firewall may block remote connections
echo   - Go to: Control Panel ^> Windows Defender Firewall
echo   - Click: Allow an app through Windows Firewall
echo   - Add: stardew-mcp.exe to allowed apps
echo ========================================
echo.
echo Waiting for remote connections...
echo (Press Ctrl+C to stop)
echo.

REM Run in server mode - listens for remote agent connections
stardew-mcp.exe -server -host "0.0.0.0" -port %PORT% -url "ws://localhost:8765/game"

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo Server exited with error code: %errorlevel%
    echo ========================================
    echo.
    echo Troubleshooting:
    echo   1. Make sure Stardew Valley is running with SMAPI
    echo   2. Make sure StardewMCP mod is installed
    echo   3. Check that port %PORT% is not already in use
    echo.
    pause
    exit /b 1
)
