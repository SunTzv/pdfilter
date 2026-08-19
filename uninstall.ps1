Write-Host "Uninstalling pdfilter..."

if (Get-Command pipx -ErrorAction SilentlyContinue) {
    # Check if pdfilter is managed by pipx
    $pipxList = pipx list 2>$null
    if ($pipxList -match "pdfilter") {
        Write-Host "Uninstalling via pipx..."
        pipx uninstall pdfilter
        Write-Host "✅ Successfully uninstalled pdfilter!"
        exit 0
    }
}

if (Get-Command pip -ErrorAction SilentlyContinue) {
    Write-Host "Attempting to uninstall via pip..."
    pip uninstall -y pdfilter
    Write-Host "✅ Successfully uninstalled pdfilter!"
    exit 0
}

Write-Host "❌ Could not find pipx or pip to uninstall pdfilter, or it wasn't installed."
exit 1
