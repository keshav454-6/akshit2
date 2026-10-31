@echo off
title CyberShield One - Ngrok Public Tunnel
echo ========================================================
echo   CyberShield One - Ngrok Public Tunnel
echo ========================================================
echo.
echo If this is your first time using ngrok, add your token:
echo   ngrok config add-authtoken YOUR_AUTHTOKEN
echo   (Get free token from: https://dashboard.ngrok.com)
echo.
echo Starting Ngrok on port 5173 (Frontend + Proxied Backend)...
echo ========================================================
ngrok http 5173 --host-header=rewrite
pause

