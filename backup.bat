@echo off
rem Odora — create a dated zip backup of the whole project on the Desktop
cd /d "%~dp0"
powershell -NoProfile -Command "$dest = Join-Path ([Environment]::GetFolderPath('Desktop')) ('Odora-backup-' + (Get-Date -Format 'yyyy-MM-dd_HH-mm') + '.zip'); Compress-Archive -Path (Get-ChildItem -Force | Where-Object Name -ne '.git').FullName -DestinationPath $dest -Force; Write-Host ('Backup created: ' + $dest)"
pause
