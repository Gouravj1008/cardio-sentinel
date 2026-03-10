# Test Authentication Endpoints
Write-Host "Testing Cardio Sentinel AI Authentication..." -ForegroundColor Cyan

# Wait for backend to be ready
Write-Host "`nWaiting for backend service..." -ForegroundColor Yellow
$maxAttempts = 10
$attempt = 0

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] Backend is ready!" -ForegroundColor Green
            break
        }
    } catch {
        $attempt++
        Write-Host "   Attempt $attempt/$maxAttempts - Waiting..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host "[ERROR] Backend service is not responding" -ForegroundColor Red
    Write-Host "Run: docker-compose logs backend" -ForegroundColor Yellow
    exit 1
}

# Test Signup
Write-Host "`n=== Testing Signup ===" -ForegroundColor Cyan
$signupData = @{
    name = "Test Doctor"
    email = "testdoctor@example.com"
    password = "test123456"
    phone = "+1234567890"
    role = "doctor"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body $signupData `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "[SUCCESS] Signup successful!" -ForegroundColor Green
    $signupResult = $response.Content | ConvertFrom-Json
    Write-Host "Token: $($signupResult.token.Substring(0,20))..." -ForegroundColor White
    $token = $signupResult.token
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    
    if ($statusCode -eq 400 -and $errorBody.message -like "*already exists*") {
        Write-Host "[INFO] User already exists, testing login instead..." -ForegroundColor Yellow
    } else {
        Write-Host "[ERROR] Signup failed: $($errorBody.message)" -ForegroundColor Red
    }
}

# Test Login
Write-Host "`n=== Testing Login ===" -ForegroundColor Cyan
$loginData = @{
    email = "testdoctor@example.com"
    password = "test123456"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "[SUCCESS] Login successful!" -ForegroundColor Green
    $loginResult = $response.Content | ConvertFrom-Json
    Write-Host "User: $($loginResult.user.name)" -ForegroundColor White
    Write-Host "Role: $($loginResult.user.role)" -ForegroundColor White
    Write-Host "Email: $($loginResult.user.email)" -ForegroundColor White
} catch {
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "[ERROR] Login failed: $($errorBody.message)" - ForegroundColor Red
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Green
