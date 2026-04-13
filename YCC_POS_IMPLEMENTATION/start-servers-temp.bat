@echo off
echo Starting API Gateway on port 3004...
cd /d C:\Users\jorma\Documents\CountryClubPOS-master\CountryClubPOS-master\YCC_POS_IMPLEMENTATION\03_API_GATEWAY
start "API Gateway" cmd /k "pnpm dev"

timeout /t 3 /nobreak >nul

echo Starting KDS on port 3002...
cd /d C:\Users\jorma\Documents\CountryClubPOS-master\CountryClubPOS-master\YCC_POS_IMPLEMENTATION\05_KDS_SYSTEM
start "KDS" cmd /k "pnpm dev"

echo.
echo Servers started! Check the windows for status.
echo API Gateway: http://localhost:3004
echo KDS: http://localhost:3002
pause
