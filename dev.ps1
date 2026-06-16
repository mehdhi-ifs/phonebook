# Starts the Phonebook backend and frontend dev servers, each in its own terminal window.
# Usage:  ./dev.ps1   (from the repo root)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "Starting Phonebook dev servers..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location -LiteralPath '$root\server'; npm run dev"
) | Out-Null
Write-Host "  backend  -> http://localhost:3001  (new window)" -ForegroundColor Green

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location -LiteralPath '$root\client'; npm run dev"
) | Out-Null
Write-Host "  frontend -> http://localhost:5173  (new window)" -ForegroundColor Green

Write-Host "Each server runs in its own terminal. Close those windows to stop them." -ForegroundColor Cyan
