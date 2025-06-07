@echo off
cd %~dp0
echo Starting Student Registration App...
set HOST=0.0.0.0
set PORT=3001
echo Server will be available at:
echo Local:        http://localhost:%PORT%
echo Network:      http://%HOST%:%PORT%
npm run dev -- -H %HOST% -p %PORT%