@echo off
:: Kill any existing server on port 8080
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" 2^>nul') do taskkill /f /pid %%a >nul 2>&1

:: Start HTTP server in background
start "" /b python -m http.server 8080 --directory "%USERPROFILE%\Desktop" >nul 2>&1

:: Brief pause then open browser
timeout /t 1 /nobreak >nul
start "" "http://localhost:8080/studio_ai_local.html"
