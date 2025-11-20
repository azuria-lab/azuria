# Adicionar variáveis via API do Vercel (sem quebras de linha)

$projectId = "prj_eGB41jux3FFDid570nucHbwEUrRh"
$teamId = "team_eGkkc0wbITaHzyWHGuCAF87z"

# Remover variáveis existentes
Write-Host "Removendo variáveis existentes..." -ForegroundColor Yellow
gh api --method DELETE "/orgs/azuria-lab/teams" 2>$null | Out-Null

# Usar Vercel API para adicionar sem quebras de linha
Write-Host "Adicionando VITE_SUPABASE_URL via API..." -ForegroundColor Cyan

$url_payload = @{
    key = "VITE_SUPABASE_URL"
    value = "https://crpzkppsriranmeumfqs.supabase.co"
    type = "plain"
    target = @("production")
} | ConvertTo-Json -Compress

$key_payload = @{
    key = "VITE_SUPABASE_ANON_KEY"
    value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM"
    type = "plain"
    target = @("production")
} | ConvertTo-Json -Compress

# Remover antigas
vercel env rm VITE_SUPABASE_URL production --yes 2>$null
vercel env rm VITE_SUPABASE_ANON_KEY production --yes 2>$null

# Adicionar via linha de comando com escape correto
$env:VITE_SUPABASE_URL = "https://crpzkppsriranmeumfqs.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM"

Write-Output $env:VITE_SUPABASE_URL | vercel env add VITE_SUPABASE_URL production
Write-Output $env:VITE_SUPABASE_ANON_KEY | vercel env add VITE_SUPABASE_ANON_KEY production

Write-Host "Variáveis adicionadas!" -ForegroundColor Green

