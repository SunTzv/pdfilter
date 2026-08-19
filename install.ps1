Write-Host "Installing pdfilter..."

$InstallTarget = "."
# If we are not in the cloned repository, install from GitHub directly
if (-Not (Test-Path "setup.py") -Or -Not (Select-String -Path "setup.py" -Pattern "pdfilter" -Quiet)) {
    $InstallTarget = "git+https://github.com/SunTzv/pdfilter.git"
}

if (Get-Command pipx -ErrorAction SilentlyContinue) {
    Write-Host "Using pipx to install pdfilter (Recommended)..."
    pipx install $InstallTarget --force
    Write-Host "✅ Successfully installed! You can now run 'pdfilter' from anywhere."
    exit 0
}

if (Get-Command pip -ErrorAction SilentlyContinue) {
    Write-Host "⚠️  'pipx' is not installed. Falling back to 'pip install --user'..."
    pip install --user $InstallTarget
    Write-Host "✅ Successfully installed!"
    Write-Host "Make sure your Python Scripts folder is in your PATH to use the 'pdfilter' command."
    exit 0
}

Write-Host "❌ Error: Neither pipx nor pip is installed. Please install Python and try again."
exit 1
