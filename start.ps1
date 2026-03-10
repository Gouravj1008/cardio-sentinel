# Cardio Sentinel AI - Quick Start Script (PowerShell)
Write-Host "Starting Cardio Sentinel AI..." -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`nChecking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Docker is running" -ForegroundColor Green

# Stop and remove existing containers
Write-Host "`nCleaning up old containers..." -ForegroundColor Yellow
docker-compose down -v 2>$null

# Build and start all services
Write-Host "`nBuilding and starting services..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for services to be healthy
Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "`nService Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n[SUCCESS] Cardio Sentinel AI is running!" -ForegroundColor Green
Write-Host "`nAccess the application:" -ForegroundColor Cyan
Write-Host "   Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "   ML Service: http://localhost:8000" -ForegroundColor White
Write-Host "   MongoDB:    mongodb://localhost:27017" -ForegroundColor White
Write-Host "   Redis:      redis://localhost:6379" -ForegroundColor White

Write-Host "`nUseful commands:" -ForegroundColor Cyan
Write-Host "   View logs:  docker-compose logs -f" -ForegroundColor White
Write-Host "   Stop all:   docker-compose down" -ForegroundColor White
Write-Host "   Restart:    docker-compose restart" -ForegroundColor White

Write-Host "`n[SUCCESS] Setup complete! Happy coding!" -ForegroundColor Green
