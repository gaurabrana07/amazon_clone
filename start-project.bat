@echo off
echo.
echo ========================================
echo    Amazon Clone Project Startup
echo ========================================
echo.

set BACKEND_DIR=C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-backend
set FRONTEND_DIR=C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-frontend

echo Checking directories...
if not exist "%BACKEND_DIR%" (
    echo ERROR: Backend directory not found!
    echo Path: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo ERROR: Frontend directory not found!
    echo Path: %FRONTEND_DIR%
    pause
    exit /b 1
)

echo ✓ Directories found successfully
echo.

echo Starting Backend Server...
start "Amazon Backend" cmd /k "cd /d "%BACKEND_DIR%" && echo Backend Server Starting... && npm run dev"

echo Waiting 3 seconds...
timeout /t 3 >nul

echo Starting Frontend Server...
start "Amazon Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && echo Frontend Server Starting... && npm run dev"

echo.
echo ========================================
echo    Servers Starting Successfully!
echo ========================================
echo.
echo Backend API:  http://localhost:5001
echo Frontend App: http://localhost:5173
echo.
echo Two new terminal windows have opened:
echo 1. Backend Server (port 5001)
echo 2. Frontend Server (port 5173)
echo.
echo Open your browser and go to: http://localhost:5173
echo.
echo NOTE: If port 5173 is busy, Vite will use the next available port.
echo Check the Frontend terminal for the actual URL.
echo.
pause