@echo off
title Git Push - Edit Fun
cd /d "%~dp0"
echo ========================================================
echo   Subiendo ultimos commits a GitHub (origin/main)...
echo ========================================================
echo.
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [EXITO] Los cambios se han subido correctamente a GitHub.
) else (
    echo [ERROR] Hubo un problema al subir los cambios.
)
echo.
pause
