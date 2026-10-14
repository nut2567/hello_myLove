[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Commit,
    [string]$RepositoryRoot
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $RepositoryRoot) { $RepositoryRoot = Split-Path -Parent $PSScriptRoot }
$RepositoryRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$resolvedCommit = & git -C $RepositoryRoot rev-parse --verify --end-of-options "$Commit^{commit}"
if ($LASTEXITCODE -ne 0) { throw 'Cannot resolve the committed revision.' }
$gitDirectory = & git -C $RepositoryRoot rev-parse --path-format=absolute --git-common-dir
if ($LASTEXITCODE -ne 0) { throw 'Cannot find the repository state directory.' }
$logsDirectory = Join-Path $gitDirectory 'local-cd/logs'
[void](New-Item -ItemType Directory -Path $logsDirectory -Force)
$worker = Join-Path $RepositoryRoot 'scripts/deploy-local.ps1'
if (-not (Test-Path -LiteralPath $worker -PathType Leaf)) { throw 'The deployment worker is missing.' }
$workersDirectory = Join-Path $gitDirectory 'local-cd/workers'
[void](New-Item -ItemType Directory -Path $workersDirectory -Force)
$queuedWorker = Join-Path $workersDirectory "$resolvedCommit.ps1"
# A checkout/branch change after commit must not remove the queued worker.
[IO.File]::Copy($worker, $queuedWorker, $true)
$shell = (Get-Process -Id $PID).Path
$stdout = Join-Path $logsDirectory "$resolvedCommit.log"
$stderr = Join-Path $logsDirectory "$resolvedCommit.error.log"
$arguments = @(
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"{0}"' -f $queuedWorker),
    '-RepositoryRoot', ('"{0}"' -f $RepositoryRoot), '-Commit', $resolvedCommit
)
$process = Start-Process -FilePath $shell -ArgumentList $arguments -WorkingDirectory $RepositoryRoot `
    -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
Write-Output "[local-cd] Queued $resolvedCommit (process $($process.Id)). Log: $stdout"
