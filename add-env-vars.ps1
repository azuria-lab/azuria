# Script para adicionar variáveis de ambiente no Vercel

$supabaseUrl = "https://crpzkppsriranmeumfqs.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM"

Write-Host "Adicionando VITE_SUPABASE_URL..." -ForegroundColor Cyan
$supabaseUrl | vercel env add VITE_SUPABASE_URL production

Write-Host "Adicionando VITE_SUPABASE_ANON_KEY..." -ForegroundColor Cyan
$supabaseKey | vercel env add VITE_SUPABASE_ANON_KEY production

Write-Host "Variáveis adicionadas com sucesso!" -ForegroundColor Green

