@echo off
REM Windows: double-click to preview the website on your own computer.
cd /d "%~dp0"
echo Beyond a room is running at http://localhost:8000  (close this window to stop)
start "" http://localhost:8000
py -m http.server 8000 || python -m http.server 8000
