# Amazon Clone Project Startup Guide

## Project Structure
```
amazon_react/
├── amazon-backend/     (Node.js/Express API)
├── amazon-frontend/    (React.js Application)
└── amazon/            (Static HTML files)
```

## Prerequisites
- Node.js v18+ installed
- npm installed
- Both backend and frontend dependencies installed

## Quick Start Guide

### Option 1: Manual Startup (Recommended)

#### Step 1: Start Backend Server
1. Open **Terminal 1** (PowerShell/Command Prompt)
2. Navigate to backend:
   ```bash
   cd C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-backend
   ```
3. Install dependencies (if not done):
   ```bash
   npm install
   ```
4. Start backend server:
   ```bash
   npm run dev
   ```
   - Backend will run on: **http://localhost:5001**
   - Look for: "✅ Server running on port 5001"

#### Step 2: Start Frontend Server
1. Open **Terminal 2** (PowerShell/Command Prompt)
2. Navigate to frontend:
   ```bash
   cd C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-frontend
   ```
3. Install dependencies (if not done):
   ```bash
   npm install
   ```
4. Start frontend server:
   ```bash
   npm run dev
   ```
   - Frontend will run on: **http://localhost:5173** (or another port)
   - Look for: "Local: http://localhost:5173"

#### Step 3: Access the Website
- Open your web browser
- Go to: **http://localhost:5173** (or the port shown in frontend terminal)
- The React app should connect to the backend API automatically

### Option 2: Automated Startup Scripts

#### For Windows (PowerShell)
Save as `start-project.ps1`:
```powershell
# Start Amazon Clone Project
Write-Host "Starting Amazon Clone Project..." -ForegroundColor Green

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-backend'; npm run dev"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-frontend'; npm run dev"

Write-Host "Both servers starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
```

#### For Windows (Batch)
Save as `start-project.bat`:
```batch
@echo off
echo Starting Amazon Clone Project...

echo Starting Backend Server...
start "Backend" cmd /k "cd /d C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-backend && npm run dev"

timeout /t 3

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173
echo.
pause
```

## Troubleshooting

### Issue 1: Port Already in Use
**Backend Error**: `EADDRINUSE: address already in use :::5001`
**Solution**: 
- Kill process using port: `netstat -ano | findstr :5001`
- Or change port in `.env` file: `PORT=5002`

**Frontend Error**: `Port 5173 is in use`
**Solution**: Vite will automatically use next available port (5174, 5175, etc.)

### Issue 2: "Cannot GET /" Error
**Problem**: You're accessing the backend URL directly
**Solution**: Access the frontend URL (usually http://localhost:5173)

### Issue 3: Frontend Can't Connect to Backend
**Check**: 
1. Backend is running on http://localhost:5001
2. Frontend API calls are pointing to correct backend URL
3. CORS is configured properly (already done in backend)

### Issue 4: "npm run dev" Not Found
**Check**:
1. You're in the correct directory
2. `package.json` exists in current directory
3. Dependencies are installed: `npm install`

### Issue 5: Environment Variables
**Backend**: Check `.env` file exists with:
```
PORT=5001
MONGODB_URI=your_mongo_url
JWT_SECRET=your_jwt_secret
```

## What to Expect

### Backend Server (http://localhost:5001)
- API endpoints available at `/api/*`
- Health check: `/health`
- Status: `/api/status`

### Frontend Application (http://localhost:5173)
- React application with Amazon Clone UI
- Product listings, shopping cart, user authentication
- Connects to backend API for data

## URLs to Bookmark
- **Frontend (Main Site)**: http://localhost:5173
- **Backend API Status**: http://localhost:5001/api/status
- **Backend Health**: http://localhost:5001/health

## Development Tips
1. Keep both terminals open while developing
2. Backend changes may require restart
3. Frontend changes auto-reload (Hot Module Replacement)
4. Use browser dev tools to debug API calls (Network tab)

## Production Deployment
For production, you'll need to:
1. Build frontend: `npm run build`
2. Configure production environment variables
3. Use process manager like PM2 for backend
4. Set up reverse proxy (nginx)
5. Configure SSL certificates