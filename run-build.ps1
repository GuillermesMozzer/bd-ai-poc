$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

foreach ($name in @('HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','GIT_HTTP_PROXY','GIT_HTTPS_PROXY')) {
  if (Test-Path "Env:$name") { Remove-Item "Env:$name" -ErrorAction SilentlyContinue }
}
$env:NPM_CONFIG_OFFLINE = 'false'
$env:npm_config_offline = 'false'
$env:npm_config_cache = (Join-Path $PSScriptRoot '.npm-cache')

npm.cmd run build
