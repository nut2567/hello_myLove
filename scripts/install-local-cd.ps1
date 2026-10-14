[CmdletBinding()]
param([string]$RepositoryRoot)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $RepositoryRoot) { $RepositoryRoot = Split-Path -Parent $PSScriptRoot }
$RepositoryRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$hook = Join-Path $RepositoryRoot '.githooks/post-commit'
if (-not (Test-Path -LiteralPath $hook -PathType Leaf)) {
    throw 'The tracked .githooks/post-commit file is missing.'
}
$existing = & git -C $RepositoryRoot config --get core.hooksPath
if ($LASTEXITCODE -notin @(0, 1)) { throw 'Cannot read the Git hook configuration.' }
if ($existing -and $existing -ne '.githooks') {
    throw "An existing hooksPath is configured ($existing). It has been preserved."
}
if (-not $existing) {
    $hooksDirectory = & git -C $RepositoryRoot rev-parse --path-format=absolute --git-path hooks
    if ($LASTEXITCODE -ne 0) { throw 'Cannot find the current Git hooks.' }
    $activeHooks = @(Get-ChildItem -LiteralPath $hooksDirectory -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -notlike '*.sample' })
    if ($activeHooks.Count -gt 0) { throw 'Existing Git hooks have been preserved; install the local CD hook alongside them.' }
}
# Git hooks require an LF shebang and no BOM, including when Git uses CRLF.
$content = [IO.File]::ReadAllText($hook).Replace("`r`n", "`n")
[IO.File]::WriteAllText($hook, $content, [Text.UTF8Encoding]::new($false))
& git -C $RepositoryRoot config --local core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) { throw 'Cannot install the local Git hook.' }
Write-Output '[local-cd] Installed: commits queue production deployment without pushing.'
