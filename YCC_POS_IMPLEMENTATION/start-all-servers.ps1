# Script para levantar todos los servidores del sistema YCC POS
# Ejecutar desde el directorio YCC_POS_IMPLEMENTATION

Write-Host "🚀 Iniciando todos los servidores del sistema YCC POS..." -ForegroundColor Green
Write-Host ""

# 1. API Gateway (Backend)
Write-Host "📡 Iniciando API Gateway en puerto 3004..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\03_API_GATEWAY'; Write-Host '🔧 API Gateway' -ForegroundColor Yellow; pnpm dev"
Start-Sleep -Seconds 3

# 2. POS (Frontend)
Write-Host "💰 Iniciando POS en puerto 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\04_CORE_POS'; Write-Host '💰 POS' -ForegroundColor Yellow; pnpm dev"
Start-Sleep -Seconds 2

# 3. KDS (Kitchen Display System)
Write-Host "👨‍🍳 Iniciando KDS en puerto 3002..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\05_KDS_SYSTEM'; Write-Host '👨‍🍳 KDS' -ForegroundColor Yellow; pnpm dev"
Start-Sleep -Seconds 2

# 4. Admin Panel
Write-Host "⚙️ Iniciando Admin Panel en puerto 3003..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\06_ADMIN_PANEL'; Write-Host '⚙️ Admin Panel' -ForegroundColor Yellow; pnpm dev"

Write-Host ""
Write-Host "✅ Todos los servidores están iniciándose..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs de acceso:" -ForegroundColor Yellow
Write-Host "   API Gateway:  http://localhost:3004" -ForegroundColor White
Write-Host "   POS:          http://localhost:3000" -ForegroundColor White
Write-Host "   KDS:          http://localhost:3002" -ForegroundColor White
Write-Host "   Admin Panel:  http://localhost:3003" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Espera 10-15 segundos para que todos los servidores estén listos..." -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Para detener todos los servidores, cierra las ventanas de PowerShell." -ForegroundColor Cyan
