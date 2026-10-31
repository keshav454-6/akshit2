@echo off
title CyberShield One - Localhost Server Starter
echo ========================================================
echo   Starting CyberShield One / FraudGuard AI Services...
echo ========================================================
echo.

:: Start FastAPI Backend in background
start "CyberShield Backend (Port 8000)" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend"

:: Wait 2 seconds for backend to bind
timeout /t 2 /nobreak >nul

:: Start React Vite Frontend
start "CyberShield Frontend (Port 5173)" cmd /k "npm --prefix frontend run dev -- --host 0.0.0.0"

:: Wait 2 seconds
timeout /t 2 /nobreak >nul

:: Open Browser to Localhost
start http://localhost:5173

echo.
echo ========================================================
echo   Services are running!
echo   - Web App: http://localhost:5173
echo   - Backend API: http://localhost:8000/docs
echo ========================================================
echo.

