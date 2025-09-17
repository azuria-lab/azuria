<#
.SYNOPSIS
  Monitora PRs específicos e realiza merge automático quando todas as condições forem satisfeitas.

.DESCRIPTION
  Para cada PR alvo:
    - Verifica se ainda está aberto.
    - Obtém estado de merge e rollup de checks.
    - Confere se todos os checks obrigatórios (Lint, Type check, Tests (smoke), Build) têm conclusão SUCCESS na execução mais recente do workflow CI.
    - Se mergeStateStatus continuar BLOCKED apenas por recalculo, tenta forçar re-fetch aguardando alguns ciclos.
    - Efetua merge (--merge) usando privilégios de admin quando possível.

.PARAMETER Numbers
  Lista de números de PR a monitorar.

.PARAMETER IntervalSeconds
  Intervalo entre ciclos de verificação.

.PARAMETER MaxCycles
  Máximo de ciclos antes de parar.

.NOTES
  Requer GitHub CLI autenticado e permissões de admin no repositório.
#>
param(
  [int[]] $Numbers = @(3,4),
  [int] $IntervalSeconds = 20,
  [int] $MaxCycles = 60,
  [string] $Owner = 'azuria-lab',
  [string] $Repo = 'azuria'
)

$RequiredChecks = @('Lint','Type check','Tests (smoke)','Build')
$script:lastMergeOutput = ''
$branchUpdated = @{}

function Write-Info($msg){ Write-Host "[INFO ] $msg" -ForegroundColor Cyan }
function Write-Warn($msg){ Write-Host "[WARN ] $msg" -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host "[ERROR] $msg" -ForegroundColor Red }

function Get-PrData($number){
  $json = gh pr view $number --json number,state,mergeStateStatus,headRefName,mergeable,statusCheckRollup 2>$null
  if(-not $json){ return $null }
  return $json | ConvertFrom-Json
}

function Test-RequiredChecksGreen($pr){
  $latestByName = @{}
  foreach($c in $pr.statusCheckRollup){
    $key = $c.name
    if(-not $key){ continue }
    if(-not $latestByName.ContainsKey($key)){
      $latestByName[$key] = $c
    } else {
      $curr = $latestByName[$key]
      $currStamp = ($curr.startedAt, $curr.completedAt | Where-Object { $_ -and $_ -ne '0001-01-01T00:00:00Z' }) | Select-Object -Last 1
      $newStamp  = ($c.startedAt, $c.completedAt | Where-Object { $_ -and $_ -ne '0001-01-01T00:00:00Z' }) | Select-Object -Last 1
      if([string]::Compare($newStamp, $currStamp) -gt 0){
        $latestByName[$key] = $c
      }
    }
  }
  foreach($req in $RequiredChecks){
    if(-not $latestByName.ContainsKey($req)){ return $false }
    $check = $latestByName[$req]
    if($check.conclusion -ne 'SUCCESS'){ return $false }
  }
  return $true
}

function Invoke-MergePullRequest($prNumber){
  Write-Info ("Tentando merge PR #{0}" -f $prNumber)
  $res = gh pr merge $prNumber --merge --admin -t ("Auto merge PR #{0}" -f $prNumber) -b "Merged automaticamente por script quando todos os checks obrigatórios passaram." 2>&1
  $script:lastMergeOutput = $res
  if($LASTEXITCODE -eq 0){
  Write-Info ("Merge concluído PR #{0}" -f $prNumber)
    return $true
  } else {
  Write-Warn ("Falha ao tentar merge PR #{0} -> {1}" -f $prNumber, $res)
    return $false
  }
}

function Update-BranchFromMain($branch){
  if($branchUpdated.ContainsKey($branch)){
    Write-Info "Branch $branch já atualizada neste ciclo."
    return $false
  }
  $current = git rev-parse --abbrev-ref HEAD 2>$null
  Write-Info "Atualizando branch $branch com origin/main (strict mode)" 
  git fetch origin 2>$null | Out-Null
  git checkout $branch 2>$null | Out-Null
  git merge origin/main --no-edit 2>&1 | ForEach-Object { Write-Host "[GIT ] $_" }
  if($LASTEXITCODE -ne 0){
    Write-Warn "Conflitos ao mesclar origin/main em $branch. Abortando atualização."
    git merge --abort 2>$null | Out-Null
    if($current){ git checkout $current 2>$null | Out-Null }
    return $false
  }
  git push origin $branch 2>&1 | ForEach-Object { Write-Host "[PUSH] $_" }
  if($current -and $current -ne $branch){ git checkout $current 2>$null | Out-Null }
  $branchUpdated[$branch]=$true
  Write-Info "Branch $branch atualizada; aguardando nova rodada de checks."
  return $true
}

$merged = @{}
for($cycle=1; $cycle -le $MaxCycles; $cycle++){
  Write-Info "Ciclo $cycle de $MaxCycles"  
  foreach($n in $Numbers){
    if($merged.ContainsKey($n)){ continue }
    $pr = Get-PrData $n
    if(-not $pr){ Write-Warn "PR #$n não encontrado"; continue }
    if($pr.state -ne 'OPEN'){
      Write-Info "PR #$n não está aberto (estado=$($pr.state))"; $merged[$n]=$true; continue
    }
  $allGreen = Test-RequiredChecksGreen $pr
  Write-Info ("PR #{0} mergeStateStatus={1} allGreen={2}" -f $n, $pr.mergeStateStatus, $allGreen)
    if($allGreen){
      if($pr.mergeStateStatus -eq 'BLOCKED'){
        Write-Warn "PR #$n ainda BLOCKED apesar de checks verdes. Tentando merge mesmo assim."        
      }
      if(Invoke-MergePullRequest $n){ 
        $merged[$n]=$true 
      } else {
        if($script:lastMergeOutput -match 'required status checks are expected'){
          # Típico de strict mode precisando atualizar branch
            if(Update-BranchFromMain $pr.headRefName){
              Write-Info "Atualização solicitada; novo ciclo aguardará checks."
            }
        }
      }
    } else {
      Write-Info "Aguardando checks obrigatórios no PR #$n"
    }
  }
  if($merged.Count -ge $Numbers.Count){ break }
  Start-Sleep -Seconds $IntervalSeconds
}

Write-Info "Resumo" 
foreach($n in $Numbers){
  if($merged.ContainsKey($n)){
    Write-Host (" - PR #{0} => merged" -f $n) -ForegroundColor Green
  } else {
    Write-Host (" - PR #{0} => não merged" -f $n) -ForegroundColor Yellow
  }
}