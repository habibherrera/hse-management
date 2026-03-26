@echo off
title HSE Management Platform
echo ============================================
echo   HSE Management Platform - Starting...
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo [2/4] Waiting for Docker to be ready...
:wait_docker
docker info >nul 2>&1
if errorlevel 1 (
    echo        Still waiting for Docker...
    timeout /t 5 /nobreak >nul
    goto wait_docker
)
echo        Docker is ready!
echo.

echo [3/4] Starting database containers...
docker compose up -d
echo        Waiting for PostgreSQL...
timeout /t 5 /nobreak >nul
echo.

echo [4/4] Starting Next.js development server...
echo.
echo ============================================
echo   App ready at: http://localhost:3000
echo   Close this window to stop the server.
echo ============================================
echo.

npm run dev
