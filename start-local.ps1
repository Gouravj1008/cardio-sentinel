# Cardio Sentinel AI - Local Development Start Script (PowerShell)
Write-Host "Starting Cardio Sentinel AI (Local Development)..." -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`nChecking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Docker is running" -ForegroundColor Green

# Start only MongoDB and Redis
Write-Host "`nStarting MongoDB and Redis..." -ForegroundColor Yellow
docker-compose up -d mongo redis

Write-Host "`nWaiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if Python virtual environment exists
Write-Host "`nChecking Python environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment and start ML service
Write-Host "`nStarting ML Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { cd '$PWD'; & venv\Scripts\Activate.ps1; uvicorn main:app --reload --host 0.0.0.0 --port 8000 }"

# Start Backend
Write-Host "`nStarting Backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { cd '$PWD\backend'; npm install; npm run dev }"

# Start Frontend
Write-Host "`nStarting Frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { cd '$PWD\backend\frontend'; npm install; npm run dev }"

Write-Host "`n[SUCCESS] All services are starting..." -ForegroundColor Green
Write-Host "`nAccess the application:" -ForegroundColor Cyan
Write-Host "   Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "   ML Service: http://localhost:8000" -ForegroundColor White
Write-Host "   MongoDB:    mongodb://localhost:27017" -ForegroundColor White
Write-Host "   Redis:      redis://localhost:6379" -ForegroundColor White

Write-Host "`n[NOTE] Backend and Frontend are running in separate terminal windows" -ForegroundColor Yellow
Write-Host "[SUCCESS] Setup complete! Happy coding!" -ForegroundColor Green
