@echo off
REM Stardew MCP Server Startup Script for Windows
REM Usage: run.bat [options]
REM   -auto=true/false     Enable/disable autonomous mode
REM   -server              Run as remote server
REM   -openclaw            Connect to OpenClaw Gateway
REM   -openclaw-url        OpenClaw Gateway URL
REM   -goal "..."         Set AI goal

setlocal enabledelayedexpansion

echo ========================================
echo   Stardew Valley MCP Server
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
    echo Please run setup.bat first to build the server:
    echo   cd setup
    echo   setup.bat
    echo.
    exit /b 1
)

REM Check if config exists, create default if not
if not exist "config.yaml" (
    echo WARNING: config.yaml not found, creating default...
    (
        echo # Stardew MCP Server Configuration
        echo server:
        echo   game_url: "ws://localhost:8765/game"
        echo   auto_start: true
        echo remote:
        echo   host: "0.0.0.0"
        echo   port: 8765
        echo agent:
        echo   default_goal: "Setup and manage the farm efficiently"
        echo   llm_timeout: 60
        echo openclaw:
        echo   gateway_url: "ws://127.0.0.1:18789"
        echo   token: ""
        echo   agent_name: "stardew-farmer"
    ) > config.yaml
)

echo Starting Stardew MCP Server...
echo.
echo Connection: ws://localhost:8765/game
echo Mode: Autonomous
echo.

REM Pass all arguments to the server
stardew-mcp.exe %*

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo Server exited with error code: %errorlevel%
    echo ========================================
    echo.
    echo Troubleshooting:
    echo   1. Make sure Stardew Valley is running with SMAPI
    echo   2. Make sure StardewMCP mod is installed
    echo   3. Check that no other program is using port 8765
    echo.
    pause
    exit /b 1
)
