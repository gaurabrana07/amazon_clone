@echo off
echo Testing Frontend Startup...
echo.

set FRONTEND_DIR=C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-frontend

echo Navigating to frontend directory...
cd /d "%FRONTEND_DIR%"

echo Current directory:
cd

echo.
echo Checking package.json...
if exist package.json (
    echo ✓ package.json found
) else (
    echo ✗ package.json NOT found
    pause
    exit /b 1
)

echo.
echo Available npm scripts:
npm run

echo.
echo Starting frontend with npm run dev...
npm run dev