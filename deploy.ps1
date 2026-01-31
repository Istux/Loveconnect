# LoveConnect Deployment Script
# Run this AFTER you've completed: heroku login

Write-Host "`n=== LoveConnect Heroku Deploy ===" -ForegroundColor Pink
Write-Host ""

# Check if logged in
$auth = heroku auth:whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You need to log in to Heroku first!" -ForegroundColor Yellow
    Write-Host "Run: heroku login" -ForegroundColor Cyan
    Write-Host "Press any key when prompted, then log in via browser.`n" -ForegroundColor Gray
    exit 1
}

Write-Host "Logged in as: $auth" -ForegroundColor Green
Write-Host ""

# Get app name
$appName = Read-Host "Enter a unique app name (e.g. loveconnect-mohstiyak)"
if ([string]::IsNullOrWhiteSpace($appName)) {
    $appName = "loveconnect-" + (Get-Random -Maximum 9999)
    Write-Host "Using: $appName" -ForegroundColor Gray
}

Write-Host "`nCreating Heroku app..." -ForegroundColor Cyan
heroku create $appName

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeploying..." -ForegroundColor Cyan
    git push heroku master
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n=== Deployed! ===" -ForegroundColor Green
        Write-Host "Open: https://$appName.herokuapp.com" -ForegroundColor Cyan
        heroku open
    }
} else {
    Write-Host "App name may be taken. Try a different name." -ForegroundColor Yellow
}
