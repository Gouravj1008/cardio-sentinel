# System Requirements Check Script
Write-Host "Checking Cardio Sentinel AI System Requirements..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "   [OK] Docker installed: $dockerVersion" -ForegroundColor Green
        
        # Check if Docker is running
        $dockerInfo = docker info 2>$null
        if ($dockerInfo) {
            Write-Host "   [OK] Docker is running" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] Docker is installed but not running. Please start Docker Desktop." -ForegroundColor Yellow
            $allGood = $false
        }
    } else {
        Write-Host "   [ERROR] Docker not found. Please install Docker Desktop." -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   [ERROR] Docker not found. Please install Docker Desktop." -ForegroundColor Red
    $allGood = $false
}

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "   [OK] Node.js installed: $nodeVersion" -ForegroundColor Green
        $npmVersion = npm --version 2>$null
        Write-Host "   [OK] npm installed: v$npmVersion" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Node.js not found. Please install Node.js 18 or higher." -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   [ERROR] Node.js not found. Please install Node.js 18 or higher." -ForegroundColor Red
    $allGood = $false
}

# Check Python
Write-Host "`nChecking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "   [OK] Python installed: $pythonVersion" -ForegroundColor Green
        
        # Check pip
        $pipVersion = pip --version 2>$null
        if ($pipVersion) {
            $pipParts = $pipVersion.Split(' ')
            if ($pipParts.Length -gt 1) {
                Write-Host "   [OK] pip installed: $($pipParts[1])" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "   [ERROR] Python not found. Please install Python 3.10 or higher." -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   [ERROR] Python not found. Please install Python 3.10 or higher." -ForegroundColor Red
    $allGood = $false
}

# Check Git
Write-Host "`nChecking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "   [OK] Git installed: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Git not found (optional but recommended)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [WARN] Git not found (optional but recommended)" -ForegroundColor Yellow
}

# Check required directories
Write-Host "`nChecking project structure..." -ForegroundColor Yellow
$requiredDirs = @("backend", "backend\frontend", "ml-models")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   [OK] Found: $dir" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Missing: $dir" -ForegroundColor Red
        $allGood = $false
    }
}

# Check required files
Write-Host "`nChecking configuration files..." -ForegroundColor Yellow
$requiredFiles = @(
    "docker-compose.yml",
    "backend\.env",
    "backend\package.json",
    "backend\server.js",
    "backend\frontend\package.json",
    "ml-models\requirements.txt",
    "ml-models\main.py"
)
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   [OK] Found: $file" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Missing: $file" -ForegroundColor Red
        $allGood = $false
    }
}

# Check ports availability
Write-Host "`nChecking port availability..." -ForegroundColor Yellow
$portsToCheck = @(5000, 5173, 8000, 27017, 6379)
foreach ($port in $portsToCheck) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($connection) {
        Write-Host "   [WARN] Port $port is in use" -ForegroundColor Yellow
    } else {
        Write-Host "   [OK] Port $port is available" -ForegroundColor Green
    }
}

# Summary
Write-Host ""
$separator = "=" * 60
Write-Host $separator -ForegroundColor Cyan
if ($allGood) {
    Write-Host "[SUCCESS] All system requirements met! You're ready to go!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "   1. Run with Docker:  .\start.ps1" -ForegroundColor White
    Write-Host "   2. Or run locally:   .\start-local.ps1" -ForegroundColor White
    Write-Host "   3. Read SETUP.md for detailed instructions" -ForegroundColor White
} else {
    Write-Host "[FAIL] Some requirements are missing. Please install them first." -ForegroundColor Red
    Write-Host "`nSee SETUP.md for installation instructions" -ForegroundColor Yellow
}
Write-Host $separator -ForegroundColor Cyan
