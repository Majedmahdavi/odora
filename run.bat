@echo off
rem Odora — start the local server and open the site in the browser
cd /d "%~dp0"
echo Starting Odora at http://localhost:5500 ...
start "" http://localhost:5500
python serve.py
pause
