@echo off
echo Starting Thread game server...
echo.
echo The game will be available at:
echo   Local:   http://localhost:5173
echo   Network: http://%COMPUTERNAME%:5173
echo.
echo On your phone, open your Tailscale IP:5173 in the browser.
echo (Find your Tailscale IP by running: tailscale ip -4)
echo.
npx vite --host 0.0.0.0 --port 5173
