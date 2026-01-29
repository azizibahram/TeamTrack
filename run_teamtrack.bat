@echo off
echo Starting TeamTrack Employee Dashboard...
cd backend
start /B node index.js
timeout /t 3 /nobreak > nul
start http://localhost:3000
echo TeamTrack is running at http://localhost:3000
echo Press any key to stop the server...
pause > nul
taskkill /f /im node.exe > nul 2>&1
echo Server stopped.