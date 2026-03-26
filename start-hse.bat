@echo off
title HSE Management Platform
echo ============================================
echo   HSE Management Platform - Starting...
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Docker containers...
docker compose up -d
echo.

echo [2/3] Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak >nul
echo.

echo [3/3] Starting Next.js development server...
echo.
echo ============================================
echo   App ready at: http://localhost:3000
echo   Close this window to stop the server.
echo ============================================
echo.

npm run dev
