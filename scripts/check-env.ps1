<#
  Lista as chaves presentes em .env e .env.local sem exibir valores.
  Uso: powershell -NoProfile -File scripts/check-env.ps1
#>

function ReadKeys($path) {
  if (-not (Test-Path $path)) { return @() }
  Get-Content $path |
    Where-Object { $_ -and (-not $_.TrimStart().StartsWith('#')) -and $_.Contains('=') } |
    ForEach-Object { ($_ -split '=', 2)[0].Trim() }
}

$envFile = '.env'
$envLocal = '.env.local'

$backendRequired = @('ADMIN_UID', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')
$frontendRequired = @('VITE_ADMIN_UID', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY')

$backendFound = ReadKeys $envFile
$frontendFound = ReadKeys $envLocal

$report = [ordered]@{
  files_present       = @{ env = (Test-Path $envFile); env_local = (Test-Path $envLocal) }
  backend_found       = $backendFound
  backend_missing     = $backendRequired | Where-Object { $_ -notin $backendFound }
  frontend_found      = $frontendFound
  frontend_missing    = $frontendRequired | Where-Object { $_ -notin $frontendFound }
  service_role_in_vite = $frontendFound | Where-Object { $_ -match 'SERVICE_ROLE' }
}

$report | ConvertTo-Json -Depth 6

