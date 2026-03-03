@echo off
REM Together - Quick Start Script for Windows
echo Starting Together Game Setup...
echo.

echo [1] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 echo Backend installation failed && exit /b 1
echo Backend dependencies installed successfully!
echo.

echo [2] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 echo Frontend installation failed && exit /b 1
echo Frontend dependencies installed successfully!
echo.

echo [3] Setup Complete!
echo.
echo To start the game:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
pause
