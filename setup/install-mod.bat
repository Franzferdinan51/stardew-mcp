@echo off
REM Stardew MCP Mod Installer
REM This script builds and installs the Stardew Valley mod

echo ========================================
echo Stardew MCP - Mod Installer
echo ========================================
echo.

REM Find Stardew Valley installation
set "STARDEW_DIR="
set "SMAPI_DIR="
set "MODS_DIR="

REM Check common installation paths
if exist "%ProgramFiles%\Stardew Valley\Stardew Valley.exe" (
    set "STARDEW_DIR=%ProgramFiles%\Stardew Valley"
) else if exist "%ProgramFiles(x86)%\Stardew Valley\Stardew Valley.exe" (
    set "STARDEW_DIR=%ProgramFiles(x86)%\Stardew Valley"
) else if exist "%LocalAppData%\StardewValley\Stardew Valley.exe" (
    set "STARDEW_DIR=%LocalAppData%\StardewValley"
) else if exist "D:\Games\Stardew Valley\Stardew Valley.exe" (
    set "STARDEW_DIR=D:\Games\Stardew Valley"
)

REM Ask user if not found
if "%STARDEW_DIR%"=="" (
    echo Stardew Valley not found in common locations.
    echo Please enter your Stardew Valley installation path:
    set /p STARDEW_DIR=Path:
)

REM Check if path exists
if not exist "%STARDEW_DIR%\Stardew Valley.exe" (
    echo ERROR: Stardew Valley not found at %STARDEW_DIR%
    echo Please check the path and try again.
    exit /b 1
)

echo Found Stardew Valley at: %STARDEW_DIR%

REM Set up mod paths
set "MODS_DIR=%STARDEW_DIR%\Mods"
set "SMAPI_MODS_DIR=%MODS_DIR%"

REM Check for SMAPI
if exist "%STARDEW_DIR%\smapi.exe" (
    echo SMAPI found!
) else (
    echo WARNING: SMAPI not detected. Please install SMAPI first!
    echo Download from: https://smapi.io/
    echo.
    set /p CONTINUE=Continue anyway? (y/n):
    if /i not "%CONTINUE%"=="y" exit /b 1
)

REM Create Mods directory if needed
if not exist "%MODS_DIR%" (
    mkdir "%MODS_DIR%"
)

REM Build the C# mod
echo.
echo [1/2] Building C# mod...
cd /d "%~dp0..\mod\StardewMCP"

REM Check for dotnet
where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: .NET SDK not found
    echo Please install .NET 6.0 SDK from https://dotnet.microsoft.com/download
    exit /b 1
)

dotnet build -c Release
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    exit /b 1
)

REM Copy mod files
echo.
echo [2/2] Installing mod to Stardew Valley...
set "MOD_INSTALL_DIR=%MODS_DIR%\StardewMCP"

if not exist "%MOD_INSTALL_DIR%" (
    mkdir "%MOD_INSTALL_DIR%"
)

REM Copy all files from bin/Release
xcopy /E /Y "%~dp0..\mod\StardewMCP\bin\Release\net6.0\*" "%MOD_INSTALL_DIR%\" >nul

REM Copy manifest if not in bin
if not exist "%MOD_INSTALL_DIR%\manifest.json" (
    copy /Y "%~dp0..\mod\StardewMCP\manifest.json" "%MOD_INSTALL_DIR%\" >nul
)

echo.
echo ========================================
echo Mod installed successfully!
echo ========================================
echo.
echo Location: %MOD_INSTALL_DIR%
echo.
echo Next steps:
echo 1. Start Stardew Valley with SMAPI
echo 2. Load your save file
echo 3. Run the MCP server: cd setup ^&^& run.bat
echo ========================================
