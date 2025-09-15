<#
.SYNOPSIS
    Aplica proteção à branch principal (main) do repositório atual no GitHub.

.DESCRIPTION
        Usa GitHub CLI (gh) para configurar proteção da branch.
        Este script agora suporta dois modos:
            1. Sem config externa: aplica contexts simplificados (Lint, Type check, Tests (smoke), Build)
            2. Com config JSON (branch-protection.config.json): lê contexts de lá (chave required_status_checks.contexts)

        OBS: Foi removido o prefixo "CI /" para alinhar com os nomes reais dos jobs atuais
        e eliminar mismatch de status "expected".
      - Zero aprovações obrigatórias
      - Force push e deleção bloqueados
      - Enforce admins ativo

.PARAMETER Owner
    Dono/organização do repositório. Default: azuria-lab
.PARAMETER Repo
    Nome do repositório. Default: azuria
.PARAMETER Branch
    Branch a proteger. Default: main
.PARAMETER DryRun
    Quando definido, apenas mostra o JSON e o comando que seria executado.

.EXAMPLE
    ./scripts/apply-branch-protection.ps1

.EXAMPLE
    ./scripts/apply-branch-protection.ps1 -DryRun

.NOTES
    Requer:
      - gh autenticado (gh auth status)
      - Permissão admin sobre o repositório
#>
[CmdletBinding()]
param(
    [string]$Owner = 'azuria-lab',
    [string]$Repo = 'azuria',
    [string]$Branch = 'main',
    [switch]$DryRun,
    [string]$ConfigPath = 'branch-protection.config.json'
)

function Write-Info($msg){ Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg){ Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Verificações básicas
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Err "GitHub CLI (gh) não encontrado no PATH."; exit 1
}

gh auth status 1>$null 2>$null
if ($LASTEXITCODE -ne 0) { Write-Err "GitHub CLI não autenticado. Execute: gh auth login"; exit 1 }

Write-Info "Aplicando proteção na branch '$Branch' do repo $Owner/$Repo";

$contexts = @('Lint','Type check','Tests (smoke)','Build')

if (Test-Path -LiteralPath $ConfigPath) {
    try {
        $cfgRaw = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
        $fileContexts = $cfgRaw.required_status_checks.contexts
        if ($fileContexts -and $fileContexts.Count -gt 0) {
            $contexts = @($fileContexts)
            Write-Info ("Contexts carregados de {0}: {1}" -f $ConfigPath, ($contexts -join ', '))
        } else {
            Write-Warn "Config presente mas sem required_status_checks.contexts - usando padrão embedado."
        }
    }
    catch {
        Write-Warn ("Falha ao ler config externa ({0}): {1} - usando padrão embedado." -f $ConfigPath, $_)
    }
} else {
    Write-Info ("Nenhuma config externa encontrada; usando contexts padrão: {0}" -f ($contexts -join ', '))
}

$jsonObject = [ordered]@{
    required_status_checks = [ordered]@{
        strict = $true;
        contexts = $contexts
    };
    enforce_admins = $true;
    required_pull_request_reviews = [ordered]@{
        dismiss_stale_reviews = $false;
        require_code_owner_reviews = $false;
        required_approving_review_count = 0
    };
    restrictions = $null;
    allow_force_pushes = $false;
    allow_deletions = $false;
    required_conversation_resolution = $false;
    lock_branch = $false;
    allow_fork_syncing = $true
}

# Serializar sem BOM
$json = ($jsonObject | ConvertTo-Json -Depth 6)
$tmpFile = Join-Path $env:TEMP ("branch-protection-" + [guid]::NewGuid().ToString() + '.json')
[IO.File]::WriteAllText($tmpFile, $json, (New-Object System.Text.UTF8Encoding($false)))

Write-Info "JSON de proteção:"; Write-Host $json -ForegroundColor Gray

$apiPath = "repos/$Owner/$Repo/branches/$Branch/protection"
$cmd = "gh api --method PUT -H 'Accept: application/vnd.github+json' $apiPath --input `"$tmpFile`""
Write-Info "Comando: $cmd"

if ($DryRun) {
    Write-Warn "Dry-run: nenhuma alteração enviada."
    exit 0
}

Write-Info "Enviando proteção..."
$null = gh api --method PUT -H "Accept: application/vnd.github+json" $apiPath --input "$tmpFile"
if ($LASTEXITCODE -ne 0) { Write-Err "Falha ao aplicar proteção"; exit 1 }

Write-Info "Proteção aplicada. Validando..."
$result = gh api $apiPath | ConvertFrom-Json

$summary = [pscustomobject]@{
    strict               = $result.required_status_checks.strict
    checks               = ($result.required_status_checks.contexts -join ', ')
    approvals_required   = $result.required_pull_request_reviews.required_approving_review_count
    force_push           = $result.allow_force_pushes.enabled
    deletions            = $result.allow_deletions.enabled
    admins_enforced      = $result.enforce_admins.enabled
}

Write-Info "Resumo:"; $summary | Format-List | Out-String | Write-Host

Write-Info "Concluído."