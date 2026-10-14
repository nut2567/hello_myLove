$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$repo = Split-Path -Parent $PSScriptRoot
$worker = Join-Path $repo 'scripts/deploy-local.ps1'
$installer = Join-Path $repo 'scripts/install-local-cd.ps1'
$gitDirectory = & git -C $repo rev-parse --path-format=absolute --git-common-dir
$fixture = Join-Path $gitDirectory ('local-cd/test-' + [Guid]::NewGuid().ToString('N'))
[void](New-Item -ItemType Directory -Path $fixture -Force)
$global:CdContainers = @{}
$global:CdImages = @{}
$global:CdBuildCount = 0
$global:CdBuildFail = $false
$global:CdMainHealthFail = $false
$global:CdMainRunFail = $false
$global:CdArchiveVerified = $false

function Assert {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}
function Argument-Value {
    param([object[]]$Values, [string]$Name)
    for ($i = 0; $i -lt $Values.Count - 1; $i++) {
        if ($Values[$i] -eq $Name) { return $Values[$i + 1] }
    }
    return $null
}
# Stub Docker and HTTP, while executing real archives, Git commits, locking,
# installation and background launch. No real containers or user Git history change.
function global:docker {
    $values = @($args)
    $global:LASTEXITCODE = 0
    switch ($values[0]) {
        'version' { return 'test-engine' }
        'compose' {
            return (@{ services = @{ 'hello-next' = @{ environment = @{
                nana_technology_MONGODB_URI = 'fixture'; DATABASE_NAME = 'fixture';
                AUTH_SECRET = 'fixture'; VISITOR_TRACKING_SECRET = 'fixture'
            } } } } | ConvertTo-Json -Depth 6 -Compress)
        }
        'ps' {
            $name = (Argument-Value $values '--filter') -replace '^name=\^/', '' -replace '\$$', ''
            if ($global:CdContainers.ContainsKey($name)) { return $name }
            return
        }
        'inspect' {
            $item = $global:CdContainers[$values[-1]]
            $format = Argument-Value $values '--format'
            if ($format -eq '{{json .Config.Labels}}') { return (@{ 'io.hello-mylove.local-cd.repository' = $item.Owner } | ConvertTo-Json -Compress) }
            if ($format -eq '{{.State.Running}}') { return ([string]$item.Running).ToLowerInvariant() }
            if ($format -eq '{{.Image}}') { return $item.Image }
            if ($format -like '*RestartPolicy*') { return $item.Restart }
            throw 'Unexpected inspect query.'
        }
        'build' {
            $global:CdBuildCount++
            $source = $values[-1]
            Assert (-not (Test-Path (Join-Path $source 'uncommitted.txt'))) 'Uncommitted files leaked into the archive.'
            Assert (-not (Test-Path (Join-Path $source '.env.local'))) 'Runtime secrets leaked into the archive.'
            $global:CdArchiveVerified = $true
            if ($global:CdBuildFail) { $global:LASTEXITCODE = 1; return }
            $global:CdImages[(Argument-Value $values '-t')] = "image-$global:CdBuildCount"
            return
        }
        'run' {
            $name = Argument-Value $values '--name'
            $ownerLabel = @($values | Where-Object { $_ -like 'io.hello-mylove.local-cd.repository=*' })[0]
            $global:CdContainers[$name] = @{
                Owner = ($ownerLabel -split '=', 2)[1]; Image = $global:CdImages[$values[-1]];
                Running = $true; Restart = (Argument-Value $values '--restart')
            }
            if ($name -eq 'hello-next' -and $global:CdMainRunFail) {
                $global:CdContainers[$name].Running = $false
                $global:LASTEXITCODE = 1
            }
            return 'test-container-id'
        }
        'port' { return '127.0.0.1:49300' }
        'update' {
            $global:CdContainers[$values[-1]].Restart = $values[1] -replace '^--restart=', ''
            return $values[-1]
        }
        'stop' { $global:CdContainers[$values[-1]].Running = $false; return $values[-1] }
        'start' { $global:CdContainers[$values[-1]].Running = $true; return $values[-1] }
        'rename' {
            Assert (-not $global:CdContainers.ContainsKey($values[2])) 'Container rename collided.'
            $global:CdContainers[$values[2]] = $global:CdContainers[$values[1]]
            $global:CdContainers.Remove($values[1]); return
        }
        'rm' { $global:CdContainers.Remove($values[-1]); return $values[-1] }
        'images' {
            $image = (Argument-Value $values '--filter') -replace '^reference=', ''
            if ($global:CdImages.ContainsKey($image)) { return $image }; return
        }
        'image' { $global:CdImages.Remove($values[-1]); return }
        'tag' {
            $id = $values[1]
            if ($global:CdImages.ContainsKey($id)) { $id = $global:CdImages[$id] }
            $global:CdImages[$values[2]] = $id; return
        }
        default { throw "Unexpected Docker operation: $($values[0])" }
    }
}
function global:Invoke-WebRequest {
    param($Uri, [switch]$UseBasicParsing, $TimeoutSec)
    if ($global:CdMainHealthFail -and $Uri -like '*:3600/*') {
        return @{ StatusCode = 503; Content = '{"status":"unavailable"}' }
    }
    return @{ StatusCode = 200; Content = '{"status":"ok"}' }
}
function Expect-DeploymentFailure {
    $failed = $false
    try { & $worker -RepositoryRoot $fixture -HealthTimeoutSeconds 1 | Out-Null } catch { $failed = $true }
    Assert $failed 'The deployment unexpectedly succeeded.'
}

try {
    & git -C $fixture init -q
    & git -C $fixture config user.name 'Local CD fixture'
    & git -C $fixture config user.email 'local-cd@example.invalid'
    Set-Content -LiteralPath (Join-Path $fixture '.gitignore') -Value ".env.local`nhook-ran.txt" -Encoding Ascii
    Set-Content -LiteralPath (Join-Path $fixture '.env.local') -Value 'fixture=fixture' -Encoding Ascii
    Set-Content -LiteralPath (Join-Path $fixture 'docker-compose.yaml') -Value 'fixture' -Encoding Ascii
    Set-Content -LiteralPath (Join-Path $fixture 'code.txt') -Value 'committed' -Encoding Ascii
    & git -C $fixture add .
    & git -C $fixture commit -qm 'Fixture base'
    $first = & git -C $fixture rev-parse HEAD
    Set-Content -LiteralPath (Join-Path $fixture 'uncommitted.txt') -Value 'excluded' -Encoding Ascii

    & $worker -RepositoryRoot $fixture -HealthTimeoutSeconds 1 | Out-Null
    Assert $global:CdArchiveVerified 'The committed snapshot was not checked.'
    Assert $global:CdContainers['hello-next'].Running 'The first deployment is not running.'
    $originalImage = $global:CdContainers['hello-next'].Image
    Assert ($global:CdContainers.Count -eq 1) 'A candidate container was left behind.'
    Write-Output 'PASS: deployment uses the committed snapshot and cleans temporary resources.'

    Set-Content -LiteralPath (Join-Path $fixture 'code.txt') -Value 'next version' -Encoding Ascii
    & git -C $fixture add code.txt
    & git -C $fixture commit -qm 'Fixture next version'
    $global:CdBuildFail = $true
    Expect-DeploymentFailure
    $global:CdBuildFail = $false
    Assert ($global:CdContainers['hello-next'].Image -eq $originalImage) 'Build failure replaced the current app.'
    Write-Output 'PASS: a failed build preserves the running version.'

    $global:CdMainHealthFail = $true
    Expect-DeploymentFailure
    $global:CdMainHealthFail = $false
    Assert ($global:CdContainers['hello-next'].Image -eq $originalImage -and $global:CdContainers['hello-next'].Running) 'Health failure did not restore the previous version.'
    Assert ($global:CdImages['hello-my-love-local:current'] -eq $originalImage) 'Rollback did not restore the current image tag.'
    Write-Output 'PASS: failed production readiness rolls back to the previous container.'

    $global:CdMainRunFail = $true
    Expect-DeploymentFailure
    $global:CdMainRunFail = $false
    Assert ($global:CdContainers['hello-next'].Image -eq $originalImage -and $global:CdContainers.Count -eq 1) 'A failed Docker start blocked rollback.'
    Write-Output 'PASS: a partially created container is removed before rollback.'

    $owner = $global:CdContainers['hello-next'].Owner
    $global:CdContainers['hello-next'].Owner = 'another-project'
    $before = $global:CdBuildCount
    Expect-DeploymentFailure
    Assert ($global:CdBuildCount -eq $before -and $global:CdContainers['hello-next'].Running) 'An unrelated container was changed.'
    $global:CdContainers['hello-next'].Owner = $owner
    & $worker -RepositoryRoot $fixture -Commit $first -HealthTimeoutSeconds 1 | Out-Null
    Assert ($global:CdBuildCount -eq $before) 'A superseded commit was deployed.'
    Write-Output 'PASS: unrelated containers and superseded commits are preserved.'

    [void](New-Item -ItemType Directory -Path (Join-Path $fixture '.githooks'))
    [void](New-Item -ItemType Directory -Path (Join-Path $fixture 'scripts'))
    Copy-Item -LiteralPath (Join-Path $repo '.githooks/post-commit') -Destination (Join-Path $fixture '.githooks/post-commit')
    Copy-Item -LiteralPath (Join-Path $repo 'scripts/queue-local-deploy.ps1') -Destination (Join-Path $fixture 'scripts/queue-local-deploy.ps1')
    $stub = @'
param([string]$Commit, [string]$RepositoryRoot)
[IO.File]::WriteAllText((Join-Path $RepositoryRoot 'hook-ran.txt'), $Commit)
'@
    Set-Content -LiteralPath (Join-Path $fixture 'scripts/deploy-local.ps1') -Value $stub -Encoding Ascii
    & $installer -RepositoryRoot $fixture | Out-Null
    & git -C $fixture -c core.autocrlf=false commit --allow-empty -qm 'Trigger the real hook'
    Assert ($LASTEXITCODE -eq 0) 'The commit failed while queueing its deployment.'
    $signal = Join-Path $fixture 'hook-ran.txt'
    $watch = [Diagnostics.Stopwatch]::StartNew()
    while (-not (Test-Path -LiteralPath $signal) -and $watch.Elapsed.TotalSeconds -lt 15) { Start-Sleep -Milliseconds 100 }
    Assert (Test-Path -LiteralPath $signal) 'The real hook did not launch its background worker.'
    Assert ((Get-Content -LiteralPath $signal -Raw) -eq (& git -C $fixture rev-parse HEAD)) 'The hook queued the wrong commit.'
    & git -C $fixture config --local core.hooksPath custom-hooks
    $rejected = $false
    try { & $installer -RepositoryRoot $fixture | Out-Null } catch { $rejected = $true }
    Assert ($rejected -and (& git -C $fixture config core.hooksPath) -eq 'custom-hooks') 'An existing hook configuration was overwritten.'
    Write-Output 'PASS: a real local commit starts the worker, and existing hook settings are protected.'
} finally {
    Remove-Item Function:\docker -ErrorAction SilentlyContinue
    Remove-Item Function:\Invoke-WebRequest -ErrorAction SilentlyContinue
    $allowed = [IO.Path]::GetFullPath((Join-Path $gitDirectory 'local-cd')).TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    $resolved = [IO.Path]::GetFullPath($fixture)
    if (-not $resolved.StartsWith($allowed, [StringComparison]::OrdinalIgnoreCase)) { throw 'Fixture cleanup target is outside local CD state.' }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}
