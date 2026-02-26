@echo off
echo ========================================
echo   YCC POS - INICIAR TODAS LAS PAGINAS
echo ========================================
echo.

echo [INFO] Iniciando POS Terminal en puerto 3000...
start "POS Terminal" cmd /k "cd 04_CORE_POS && pnpm dev"

timeout /t 3 >nul

echo [INFO] Iniciando KDS System en puerto 3002...
start "KDS System" cmd /k "cd 05_KDS_SYSTEM && pnpm dev"

timeout /t 3 >nul

echo [INFO] Iniciando Admin Panel en puerto 3003...
start "Admin Panel" cmd /k "cd 06_ADMIN_PANEL && pnpm dev"

echo.
echo ========================================
echo   APLICACIONES INICIADAS
echo ========================================
echo   POS Terminal: http://localhost:3000
echo   KDS System:   http://localhost:3002
echo   Admin Panel:  http://localhost:3003
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
