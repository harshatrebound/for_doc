# Script to update image URLs in publication_cms.csv
# Replace /uploads/content/ with https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/

$csvPath = "docs\publication_cms.csv"
$backupPath = "docs\publication_cms.original.csv"

# Create a backup of the original file
Copy-Item -Path $csvPath -Destination $backupPath -Force
Write-Host "Backup created at $backupPath"

# Read the CSV content
$content = Get-Content -Path $csvPath -Raw

# Replace image URLs in FeaturedImageURL column for unquoted values
$content = $content -replace ',/uploads/content/([^,]+),', ',https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/$1,'

# Replace image URLs in FeaturedImageURL column for quoted values
$content = $content -replace '"/uploads/content/([^"]+)"', '"https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/$1"'

# Replace image URLs in ContentBlocksJSON column - this is more complex due to nested JSON
$content = $content -replace '\\"/uploads/content/([^\\]+)\\', '\\"https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/$1\\'

# Save the modified content back to the CSV file
$content | Set-Content -Path $csvPath -Force

Write-Host "Image URLs updated in $csvPath"
Write-Host "Please verify the changes before committing to the repository" 