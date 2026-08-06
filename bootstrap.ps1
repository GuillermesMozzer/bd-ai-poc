param(
  [switch]$ForceClean
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host '== Bootstrap local environment =='

# Normalize environment that commonly breaks npm connectivity in restricted shells
foreach ($name in @('HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','GIT_HTTP_PROXY','GIT_HTTPS_PROXY')) {
  if (Test-Path "Env:$name") { Remove-Item "Env:$name" -ErrorAction SilentlyContinue }
}
$env:NPM_CONFIG_OFFLINE = 'false'
$env:npm_config_offline = 'false'
$env:npm_config_cache = (Join-Path $PSScriptRoot '.npm-cache')

if (-not (Test-Path (Join-Path $PSScriptRoot '.env.local'))) {
  Copy-Item (Join-Path $PSScriptRoot '.env.example') (Join-Path $PSScriptRoot '.env.local')
  Write-Host 'Created .env.local from .env.example'
}

if ($ForceClean -and (Test-Path (Join-Path $PSScriptRoot 'node_modules'))) {
  Write-Host 'Cleaning node_modules and lockfile cache state'
  cmd /c rmdir /s /q node_modules | Out-Null
}

Write-Host 'Installing dependencies...'
npm.cmd install --ignore-scripts --prefer-online --no-audit --no-fund

Write-Host 'Bootstrap complete.'
Write-Host 'Next: update .env.local (GEMINI_API_KEY), then run .\\run-dev.ps1 or .\\run-build.ps1'
