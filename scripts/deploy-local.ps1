[CmdletBinding()]
param(
    [string]$Commit = 'HEAD',
    [string]$RepositoryRoot,
    [string]$EnvironmentFile,
    [switch]$WorkingTree,
    [ValidateRange(1, 3600)][int]$LockTimeoutSeconds = 900,
    [ValidateRange(1, 300)][int]$HealthTimeoutSeconds = 90
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $RepositoryRoot) { $RepositoryRoot = Split-Path -Parent $PSScriptRoot }

function Invoke-Native {
    param([string]$Command, [string[]]$Arguments)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Command failed (exit $LASTEXITCODE)." }
}

function Read-Native {
    param([string]$Command, [string[]]$Arguments)
    $output = @(& $Command @Arguments)
    if ($LASTEXITCODE -ne 0) { throw "$Command failed (exit $LASTEXITCODE)." }
    return ($output -join "`n").Trim()
}

function Test-Container {
    param([string]$Name)
    $names = Read-Native docker @('ps', '-a', '--filter', "name=^/$Name$", '--format', '{{.Names}}')
    return $names -eq $Name
}

function Assert-OwnedContainer {
    param([string]$Name)
    if (-not (Test-Container $Name)) { return }
    $labels = (Read-Native docker @('inspect', '--format', '{{json .Config.Labels}}', $Name)) | ConvertFrom-Json
    $owner = $null
    if ($labels) { $owner = $labels.PSObject.Properties['io.hello-mylove.local-cd.repository'] }
    if (-not $owner -or $owner.Value -ne $script:RepositoryId) { throw "Container $Name belongs to another deployment; it has been preserved." }
}

function Remove-OwnedContainer {
    param([string]$Name)
    if (-not (Test-Container $Name)) { return }
    Assert-OwnedContainer $Name
    if ((Read-Native docker @('inspect', '--format', '{{.State.Running}}', $Name)) -eq 'true') {
        [void](Read-Native docker @('stop', '--timeout', '10', $Name))
    }
    [void](Read-Native docker @('rm', $Name))
}

function Wait-Healthy {
    param([string]$Name, [string]$Url)
    $watch = [Diagnostics.Stopwatch]::StartNew()
    while ($watch.Elapsed.TotalSeconds -lt $HealthTimeoutSeconds) {
        $running = Read-Native docker @('inspect', '--format', '{{.State.Running}}', $Name)
        if ($running -ne 'true') { throw "Container $Name exited before becoming ready." }
        try {
            $response = Invoke-WebRequest -Uri "$Url/api/health" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200 -and ($response.Content | ConvertFrom-Json).status -eq 'ok') { return }
        } catch { }
        Start-Sleep -Seconds 2
    }
    throw "Container $Name did not become ready within $HealthTimeoutSeconds seconds."
}

function Start-AppContainer {
    param([string]$Name, [string]$Image, [string]$Publish, [string]$Restart)
    [void](Read-Native docker @(
        'run', '-d', '--name', $Name, '--restart', $Restart,
        '--label', "io.hello-mylove.local-cd.repository=$script:RepositoryId",
        '--label', "io.hello-mylove.local-cd.revision=$script:Revision",
        '--env-file', $script:RuntimeEnvironmentFile, '-p', $Publish, $Image
    ))
}

$RepositoryRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
if (-not $EnvironmentFile) { $EnvironmentFile = Join-Path $RepositoryRoot '.env.local' }
$EnvironmentFile = (Resolve-Path -LiteralPath $EnvironmentFile).Path
$revision = Read-Native git @('-C', $RepositoryRoot, 'rev-parse', '--verify', '--end-of-options', "$Commit^{commit}")
$gitDirectory = Read-Native git @('-C', $RepositoryRoot, 'rev-parse', '--path-format=absolute', '--git-common-dir')
$stateDirectory = Join-Path $gitDirectory 'local-cd'
$stagingDirectory = Join-Path $stateDirectory 'staging'
[void](New-Item -ItemType Directory -Path $stagingDirectory -Force)
$sha = [Security.Cryptography.SHA256]::Create()
try {
    $script:RepositoryId = ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($gitDirectory.ToLowerInvariant())))).Replace('-', '').ToLowerInvariant().Substring(0, 16)
} finally { $sha.Dispose() }
$script:Revision = $revision
$identifier = [Guid]::NewGuid().ToString('N')
$stage = Join-Path $stagingDirectory $identifier
$archive = Join-Path $stagingDirectory "$identifier.tar"
$script:RuntimeEnvironmentFile = Join-Path $stateDirectory "$identifier.env"
$candidate = "hello-next-candidate-$($identifier.Substring(0, 12))"
$main = 'hello-next'
$previous = 'hello-next-previous'
$image = "hello-my-love-local:build-$identifier"
$lock = $null
$oldMoved = $false
$mainStarted = $false
$oldRunning = $false
$oldImage = $null
$oldRestart = $null
$previousEnvironmentFile = [Environment]::GetEnvironmentVariable('HELLO_MYLOVE_ENV_FILE', 'Process')

try {
    $watch = [Diagnostics.Stopwatch]::StartNew()
    while (-not $lock) {
        try {
            $lock = [IO.File]::Open((Join-Path $stateDirectory 'deploy.lock'), [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
        } catch [IO.IOException] {
            if ($watch.Elapsed.TotalSeconds -ge $LockTimeoutSeconds) { throw 'Another local deployment still holds the lock.' }
            Start-Sleep -Seconds 2
        }
    }
    if (-not $WorkingTree -and (Read-Native git @('-C', $RepositoryRoot, 'rev-parse', 'HEAD')) -ne $revision) {
        Write-Output "[local-cd] Skipped superseded commit $revision."
        return
    }
    [void](Read-Native docker @('version', '--format', '{{.Server.Version}}'))
    Assert-OwnedContainer $main
    Assert-OwnedContainer $previous
    if ($WorkingTree) {
        $source = $RepositoryRoot
        $script:Revision = "working-tree-$revision"
    } else {
        [void](New-Item -ItemType Directory -Path $stage)
        Invoke-Native git @('-C', $RepositoryRoot, 'archive', '--format=tar', "--output=$archive", $revision)
        Invoke-Native tar @('-xf', $archive, '-C', $stage)
        $source = $stage
    }

    # Compose parses dotenv quotes/interpolation. Capture its JSON privately;
    # never echo environment values or include the file in an image/snapshot.
    [Environment]::SetEnvironmentVariable('HELLO_MYLOVE_ENV_FILE', $EnvironmentFile, 'Process')
    $composeFile = Join-Path $source 'docker-compose.yaml'
    $config = (Read-Native docker @('compose', '--project-directory', $source, '-f', $composeFile, 'config', '--format', 'json')) | ConvertFrom-Json
    $environment = $config.services.'hello-next'.environment
    $required = @('nana_technology_MONGODB_URI', 'DATABASE_NAME', 'VISITOR_TRACKING_SECRET')
    foreach ($name in $required) {
        $property = $environment.PSObject.Properties[$name]
        if (-not $property -or [string]::IsNullOrWhiteSpace([string]$property.Value)) { throw "Required runtime variable $name is missing." }
    }
    $authConfigured = @('AUTH_SECRET', 'NEXTAUTH_SECRET', 'PATH_ACCESS_SECRET') | Where-Object {
        $property = $environment.PSObject.Properties[$_]
        $property -and -not [string]::IsNullOrWhiteSpace([string]$property.Value)
    }
    if (-not $authConfigured) { throw 'An authentication secret is required for production.' }
    $lines = foreach ($property in $environment.PSObject.Properties) {
        if ($null -eq $property.Value) { continue }
        if ([string]$property.Value -match "[`r`n]") { throw "Runtime variable $($property.Name) contains an unsupported newline." }
        "$($property.Name)=$($property.Value)"
    }
    [IO.File]::WriteAllLines($script:RuntimeEnvironmentFile, [string[]]$lines, [Text.UTF8Encoding]::new($false))

    Write-Output "[local-cd] Building $script:Revision."
    $buildingStatus = @{ status = 'building'; revision = $script:Revision; url = 'http://localhost:3600' }
    [IO.File]::WriteAllText((Join-Path $stateDirectory 'status.json'), ($buildingStatus | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
    Invoke-Native docker @('build', '--platform', 'linux/amd64', '--label', "io.hello-mylove.local-cd.repository=$script:RepositoryId", '--label', "io.hello-mylove.local-cd.revision=$script:Revision", '-t', $image, $source)
    Start-AppContainer $candidate $image '127.0.0.1::3600' 'no'
    $mapping = Read-Native docker @('port', $candidate, '3600/tcp')
    if ($mapping -notmatch '^127\.0\.0\.1:(\d+)$') { throw 'Cannot find the candidate localhost port.' }
    Wait-Healthy $candidate "http://$mapping"
    if (-not $WorkingTree -and (Read-Native git @('-C', $RepositoryRoot, 'rev-parse', 'HEAD')) -ne $revision) {
        Write-Output "[local-cd] A newer commit arrived; preserving the running app."
        return
    }

    # Keep the current app until the isolated candidate (including DB) is ready.
    Assert-OwnedContainer $main
    Assert-OwnedContainer $previous
    if (Test-Container $main) {
        $oldImage = Read-Native docker @('inspect', '--format', '{{.Image}}', $main)
        $oldRunning = (Read-Native docker @('inspect', '--format', '{{.State.Running}}', $main)) -eq 'true'
        $oldRestart = Read-Native docker @('inspect', '--format', '{{.HostConfig.RestartPolicy.Name}}', $main)
        if (Test-Container $previous) { [void](Read-Native docker @('rm', $previous)) }
        [void](Read-Native docker @('update', '--restart=no', $main))
        if ($oldRunning) { [void](Read-Native docker @('stop', '--timeout', '10', $main)) }
        try {
            [void](Read-Native docker @('rename', $main, $previous))
            $oldMoved = $true
        } catch {
            [void](Read-Native docker @('update', "--restart=$oldRestart", $main))
            if ($oldRunning) { [void](Read-Native docker @('start', $main)) }
            throw
        }
    }
    $mainStarted = $true
    Start-AppContainer $main $image '127.0.0.1:3600:3600' 'unless-stopped'
    Wait-Healthy $main 'http://127.0.0.1:3600'
    [void](Read-Native docker @('tag', $image, 'hello-my-love-local:current'))
    if ($oldImage) { [void](Read-Native docker @('tag', $oldImage, 'hello-my-love-local:previous')) }
    $status = @{ status = 'ready'; revision = $script:Revision; url = 'http://localhost:3600'; container = $main }
    [IO.File]::WriteAllText((Join-Path $stateDirectory 'status.json'), ($status | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
    $oldMoved = $false
    Write-Output "[local-cd] Ready: http://localhost:3600 ($script:Revision)."
} catch {
    $failure = $_
    if ($mainStarted -and (Test-Container $main)) {
        Remove-OwnedContainer $main
    }
    if ($oldMoved) {
        [void](Read-Native docker @('rename', $previous, $main))
        [void](Read-Native docker @('update', "--restart=$oldRestart", $main))
        if ($oldRunning) { [void](Read-Native docker @('start', $main)) }
        [void](Read-Native docker @('tag', $oldImage, 'hello-my-love-local:current'))
        Write-Output '[local-cd] Restored the previous container.'
    }
    if ($lock) {
        $status = @{ status = 'failed'; revision = $script:Revision; error = $failure.Exception.Message; url = 'http://localhost:3600' }
        [IO.File]::WriteAllText((Join-Path $stateDirectory 'status.json'), ($status | ConvertTo-Json), [Text.UTF8Encoding]::new($false))
    }
    throw $failure
} finally {
    if ($lock) {
        try {
            if (Test-Container $candidate) {
                Remove-OwnedContainer $candidate
            }
            # Remove only this build tag. current/previous keep the usable images.
            $tags = Read-Native docker @('images', '--filter', "reference=$image", '--format', '{{.Repository}}:{{.Tag}}')
            if ($tags -eq $image) { [void](Read-Native docker @('image', 'rm', $image)) }
        } catch { Write-Warning 'Could not remove a temporary Docker build resource.' }
        $lock.Dispose()
    }
    [Environment]::SetEnvironmentVariable('HELLO_MYLOVE_ENV_FILE', $previousEnvironmentFile, 'Process')
    if (Test-Path -LiteralPath $script:RuntimeEnvironmentFile) { Remove-Item -LiteralPath $script:RuntimeEnvironmentFile -Force }
    if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive -Force }
    if (Test-Path -LiteralPath $stage) {
        $resolvedStage = [IO.Path]::GetFullPath($stage)
        $allowedRoot = [IO.Path]::GetFullPath($stagingDirectory).TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
        if (-not $resolvedStage.StartsWith($allowedRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Refusing to remove a path outside deployment staging.' }
        Remove-Item -LiteralPath $resolvedStage -Recurse -Force
    }
}
