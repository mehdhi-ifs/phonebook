@echo off
REM Starts the Phonebook backend and frontend dev servers, each in its own terminal window.
REM Double-click this file, or run `dev.bat` from the repo root.

start "Phonebook API" cmd /k "cd /d "%~dp0server" && npm run dev"
start "Phonebook Web" cmd /k "cd /d "%~dp0client" && npm run dev"

echo Backend  -> http://localhost:3001  (new window)
echo Frontend -> http://localhost:5173  (new window)
