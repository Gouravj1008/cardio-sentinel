# ML Engine Startup Script for Windows PowerShell
# Starts the Python ML training service

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🏥 CARDIO-SENTINEL: ML Training Engine Startup           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Python
$pythonCmd = Get-Command python3 -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
}

if (-not $pythonCmd) {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Python found" -ForegroundColor Green
$version = & python --version 2>&1
Write-Host "   Version: $version" -ForegroundColor Green
Write-Host ""

# Create virtual environment if needed
$venvPath = "ml_venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "📦 Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv $venvPath
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
    Write-Host ""
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& "$venvPath\Scripts\Activate.ps1"
Write-Host "✅ Virtual environment activated" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📥 Installing ML dependencies..." -ForegroundColor Yellow
pip install -q -r requirements-ml.txt
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Start ML engine
Write-Host "🚀 Starting ML Training Engine on port 8000..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

python ml_engine.py server

Write-Host ""
Write-Host "✅ ML Engine running!" -ForegroundColor Green
Write-Host "📊 API endpoints:" -ForegroundColor Green
Write-Host "   GET  http://localhost:8000/health"
Write-Host "   POST http://localhost:8000/api/ml/train"
Write-Host "   GET  http://localhost:8000/api/ml/predict/<patient_id>"
Write-Host "   GET  http://localhost:8000/api/ml/models"
Write-Host ""
