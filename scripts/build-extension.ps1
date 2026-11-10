$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
  npx --yes esbuild@0.28.2 src/extension/content.js --bundle --format=iife --target=chrome110 --outfile=chrome-extension/checkform-content.js
  if ($LASTEXITCODE -ne 0) { throw "Extension build failed: $LASTEXITCODE" }
} finally {
  Pop-Location
}
