@echo off
echo ==========================================
echo    INICIANDO SERVIDORES YCC POS
echo ==========================================
echo.

echo [1/4] Iniciando API Gateway (Puerto 3004)...
start "API Gateway - Port 3004" cmd /k "cd /d C:\Users\jorma\Documents\CountryClubPOS-master\CountryClubPOS-master\YCC_POS_IMPLEMENTATION\03_API_GATEWAY && pnpm dev"

timeout /t 2 /nobreak >nul

echo [2/4] Iniciando KDS (Puerto 3002)...
start "KDS - Port 3002" cmd /k "cd /d C:\Users\jorma\Documents\CountryClubPOS-master\CountryClubPOS-master\YCC_POS_IMPLEMENTATION\05_KDS_SYSTEM && pnpm dev"

timeout /t 2 /nobreak >nul

echo [3/4] Iniciando POS Core (Puerto 3000)...
start "POS Core - Port 3000" cmd /k "cd /d C:\Users\jorma\Documents\CountryClubPOS-master\CountryClubPOS-master\YCC_POS_IMPLEMENTATION\04_CORE_POS && pnpm dev"

timeout /t 2 /nobreak >nul

echo [4/4] Iniciando Admin Panel (Puerto 3001)...
start "Admin Panel - Port 3001" cmd /k "cd /d C:\Users\jorma\Documents\CountryClubPOS-master\CountryClubPOS-master\YCC_POS_IMPLEMENTATION\06_ADMIN_PANEL && pnpm dev"

echo.
echo ==========================================
echo    SERVIDORES INICIANDO...
echo ==========================================
echo.
echo API Gateway: http://localhost:3004
echo KDS:         http://localhost:3002
echo POS Core:    http://localhost:3000
echo Admin Panel: http://localhost:3001
echo.
echo Espera 15 segundos y verifica las ventanas.
echo.
pause
