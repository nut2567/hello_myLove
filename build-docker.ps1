# Get name and version from package.json
$NAME = (Get-Content .\package.json | ConvertFrom-Json).name
$VERSION = (Get-Content .\package.json | ConvertFrom-Json).version

# Get the current git branch name
$BRANCH = git rev-parse --abbrev-ref HEAD

# Replace invalid characters in branch name
$BRANCH = $BRANCH -replace '[^a-zA-Z0-9-_]', ''

if ($BRANCH -ne "main") {
    $VERSION = "${VERSION}-${BRANCH}"
}

# Build the Docker image
docker build --platform linux/amd64 --build-arg PORT=3600 -t ${NAME}:${VERSION} .

# Save the image to a tar file
docker save -o "${NAME}-v${VERSION}.tar" ${NAME}:${VERSION}

Write-Host "Docker image built and saved as ${NAME}-v${VERSION}.tar"
