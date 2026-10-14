$ErrorActionPreference = "Stop"

function Assert-LastCommand {
    param([string]$Message)

    if ($LASTEXITCODE -ne 0) {
        throw "${Message} failed with exit code ${LASTEXITCODE}"
    }
}

$Package = Get-Content .\package.json -Raw | ConvertFrom-Json
$Name = $Package.name
$Version = $Package.version

$Branch = (git rev-parse --abbrev-ref HEAD).Trim()
Assert-LastCommand "Reading git branch"

$Branch = $Branch -replace '[^a-zA-Z0-9-_]', ''


$Image = "${Name}:${Version}"
$OutputFileName = "${Name}-v${Version}.tar"
$OutputPath = Join-Path (Get-Location) $OutputFileName
$TempPath = Join-Path (Get-Location) ".docker-save-${Name}-v${Version}-${PID}.tmp"
$ShaPath = "${OutputPath}.sha256"

if (Test-Path -LiteralPath $TempPath) {
    Remove-Item -LiteralPath $TempPath -Force
}

docker build --platform linux/amd64 --build-arg PORT=3055 -t $Image .
Assert-LastCommand "Docker build"

docker image inspect $Image *> $null
Assert-LastCommand "Docker image inspect"

docker save -o $TempPath $Image
Assert-LastCommand "Docker save"

$TempFile = Get-Item -LiteralPath $TempPath
if ($TempFile.Length -le 0) {
    throw "Docker save produced an empty file: ${TempPath}"
}

$MaxAttempts = 10
for ($Attempt = 1; $Attempt -le $MaxAttempts; $Attempt++) {
    try {
        if (Test-Path -LiteralPath $OutputPath) {
            Remove-Item -LiteralPath $OutputPath -Force
        }

        Move-Item -LiteralPath $TempPath -Destination $OutputPath -Force
        break
    }
    catch {
        if ($Attempt -eq $MaxAttempts) {
            throw "Cannot replace ${OutputFileName}. Close any app using it, then rerun this script. Saved temp file remains at ${TempPath}. Last error: $($_.Exception.Message)"
        }

        Start-Sleep -Seconds 2
    }
}

$OutputFile = Get-Item -LiteralPath $OutputPath
if ($OutputFile.Length -le 0) {
    throw "Final Docker image tar is empty: ${OutputPath}"
}

$Hash = Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256
Set-Content -LiteralPath $ShaPath -Value "$($Hash.Hash.ToLowerInvariant())  $OutputFileName"

Write-Host "Docker image built and saved exactly as ${OutputFileName}"
Write-Host "Size: $($OutputFile.Length) bytes"
Write-Host "SHA256: $($Hash.Hash.ToLowerInvariant())"
