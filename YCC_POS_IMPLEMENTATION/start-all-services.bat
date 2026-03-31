@echo off
echo ========================================
echo INICIANDO TODOS LOS SERVICIOS YCC POS
echo ========================================
echo.

REM Detener procesos de Node.js existentes
echo Deteniendo procesos existentes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Iniciar API Gateway
echo.
echo [1/4] Iniciando API Gateway (Puerto 3004)...
start "API Gateway" cmd /k "cd /d %~dp0\03_API_GATEWAY && pnpm dev"
timeout /t 5 /nobreak >nul

REM Iniciar POS
echo [2/4] Iniciando POS (Puerto 3000)...
start "POS" cmd /k "cd /d %~dp0\04_CORE_POS && pnpm dev"
timeout /t 3 /nobreak >nul

REM Iniciar KDS
echo [3/4] Iniciando KDS (Puerto 3002)...
start "KDS" cmd /k "cd /d %~dp0\05_KDS_SYSTEM && pnpm dev"
timeout /t 3 /nobreak >nul

REM Iniciar Admin Panel
echo [4/4] Iniciando Admin Panel (Puerto 3003)...
start "Admin Panel" cmd /k "cd /d %~dp0\06_ADMIN_PANEL && pnpm dev"

echo.
echo ========================================
echo TODOS LOS SERVICIOS INICIADOS
echo ========================================
echo.
echo API Gateway: http://localhost:3004
echo POS:         http://localhost:3000
echo KDS:         http://localhost:3002
echo Admin Panel: http://localhost:3003
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
