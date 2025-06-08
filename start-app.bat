@echo off
echo Starting local server...

:: Start the server (assuming it runs on port 3000)
start /B npm run dev

:: Wait a few seconds for the server to start
timeout /t 2 /nobreak

:: Open the default browser with localhost
start http://localhost:3000

echo Server started and browser opened!
