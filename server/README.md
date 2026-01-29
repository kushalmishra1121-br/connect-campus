Development tips for `server`

Run dev server (recommended):
- npm run dev    # uses nodemon

If PowerShell blocks npm scripts (error about npm.ps1 / execution policy):
- Run this once in an elevated PowerShell (or as your user):
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
- Or run the dev script from Git Bash / CMD to avoid PowerShell script shims.

Quick alternatives:
- Use the Node built-in watch (no nodemon needed):
  npm run dev:watch
- Run nodemon directly without npm shims:
  npx nodemon index.js

If port 5000 is already in use:
- Find PID: netstat -ano | findstr :5000
- Kill process: taskkill /PID <PID> /F
- Or use a one-liner to kill the port: npx kill-port 5000

Notes:
- Node v18+ supports `node --watch` which avoids nodemon and PowerShell shims.
- Use a dedicated terminal window for `npm run dev` so you can easily stop it when done.

PowerShell helper scripts
-------------------------
- `start-dev.ps1` — opens a new PowerShell window and runs `npm run dev` in the `server` folder.
  - Usage (from `server` folder): `.\\start-dev.ps1`
  - Use watch mode: `.\\start-dev.ps1 -UseWatch` (runs `npm run dev:watch`)
- `start-dev.bat` — a CMD-friendly fallback that opens PowerShell and runs `npm run dev`.
  - Usage: `start-dev.bat`

Both scripts call PowerShell with `-ExecutionPolicy Bypass` for the spawned window to avoid altering your global execution policy.