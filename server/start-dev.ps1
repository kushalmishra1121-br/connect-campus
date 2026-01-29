Param(
    [switch]$UseWatch
)

# Resolve the script directory so commands run from the project root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$cmd = if ($UseWatch) { 'npm run dev:watch' } else { 'npm run dev' }
$run = "cd '$scriptDir'; $cmd"

Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-Command",$run
Write-Host "Started dev in new PowerShell window with: $cmd"