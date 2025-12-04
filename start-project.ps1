# Amazon Clone Project Startup Script
# Save as start-project.ps1 and run with: .\start-project.ps1

Write-Host "🚀 Starting Amazon Clone Project..." -ForegroundColor Green
Write-Host ""

# Define paths
$BackendPath = "C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-backend"
$FrontendPath = "C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-frontend"

# Check if directories exist
if (-not (Test-Path $BackendPath)) {
    Write-Host "❌ Backend directory not found: $BackendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $FrontendPath)) {
    Write-Host "❌ Frontend directory not found: $FrontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Directories found successfully" -ForegroundColor Green

# Start Backend Server
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
$BackendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Cyan; npm run dev" -PassThru

# Wait a moment
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
$FrontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; Write-Host 'Frontend Server Starting...' -ForegroundColor Cyan; npm run dev" -PassThru

# Wait for servers to initialize
Write-Host "⏳ Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Backend API:  http://localhost:5001" -ForegroundColor White
Write-Host "   Frontend App: http://localhost:5173 (or next available port)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Open your browser and go to the Frontend App URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Keep both terminal windows open" -ForegroundColor White
Write-Host "   - Frontend will auto-reload on file changes" -ForegroundColor White
Write-Host "   - Check browser console for any errors" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")