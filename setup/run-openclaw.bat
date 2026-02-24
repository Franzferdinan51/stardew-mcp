@echo off
REM Stardew MCP Server - OpenClaw Gateway Mode
REM This connects to OpenClaw Gateway as a tool provider
REM Usage: run-openclaw.bat [gateway_url]

setlocal enabledelayedexpansion

set GATEWAY_URL=%1
if "%GATEWAY_URL%"=="" set GATEWAY_URL=ws://127.0.0.1:18789

echo ========================================
echo   Stardew MCP - OpenClaw Gateway
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

REM Get token from environment if set
set OC_TOKEN=
if defined OPENCLAW_GATEWAY_TOKEN (
    set OC_TOKEN=%OPENCLAW_GATEWAY_TOKEN%
    echo Using token from environment
)

echo Starting Stardew MCP with OpenClaw Gateway...
echo.
echo Gateway URL: %GATEWAY_URL%
echo.
echo ========================================
echo Connecting to OpenClaw Gateway...
echo ========================================
echo.

REM Run in OpenClaw Gateway mode
stardew-mcp.exe -openclaw -openclaw-url "%GATEWAY_URL%" -openclaw-token "%OC_TOKEN%"

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo Server exited with error code: %errorlevel%
    echo ========================================
    echo.
    echo Troubleshooting:
    echo   1. Make sure OpenClaw Gateway is running
    echo   2. Check the gateway URL is correct
    echo   3. Verify your authentication token
    echo   4. Make sure Stardew Valley is running with SMAPI
    echo.
    pause
    exit /b 1
)
