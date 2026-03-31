Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNÓSTICO DE SERVICIOS YCC POS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar puertos
Write-Host "📊 Verificando puertos..." -ForegroundColor Yellow
$ports = @(3000, 3002, 3003, 3004)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  ✅ Puerto $port - ACTIVO (PID: $($connection.OwningProcess))" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Puerto $port - INACTIVO" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🌐 Probando endpoints..." -ForegroundColor Yellow

# Test API Gateway
try {
    $apiTest = Invoke-WebRequest -Uri "http://localhost:3004/health" -UseBasicParsing -TimeoutSec 2
    Write-Host "  ✅ API Gateway (3004) - OK" -ForegroundColor Green
} catch {
    Write-Host "  ❌ API Gateway (3004) - ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POS
try {
    $posTest = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
    if ($posTest.StatusCode -eq 200) {
        Write-Host "  ✅ POS (3000) - OK" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ POS (3000) - ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test KDS
try {
    $kdsTest = Invoke-WebRequest -Uri "http://localhost:3002" -UseBasicParsing -TimeoutSec 2
    if ($kdsTest.StatusCode -eq 200) {
        Write-Host "  ✅ KDS (3002) - OK" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ KDS (3002) - ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Admin Panel
try {
    $adminTest = Invoke-WebRequest -Uri "http://localhost:3003" -UseBasicParsing -TimeoutSec 2
    if ($adminTest.StatusCode -eq 200) {
        Write-Host "  ✅ Admin Panel (3003) - OK" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ Admin Panel (3003) - ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNÓSTICO COMPLETADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
