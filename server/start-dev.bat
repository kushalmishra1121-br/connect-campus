@echo off
REM Start development server in a new PowerShell window (fallback for CMD users)
cd /d "%~dp0"
powershell -NoExit -ExecutionPolicy Bypass -Command "npm run dev"