
$filePath = "src\pages\TestLab.tsx"
$bytes = [System.IO.File]::ReadAllBytes($filePath)

# Read the file as Latin-1 (because it was double-encoded: UTF-8 bytes read as Latin-1 then saved)
$latin1Encoding = [System.Text.Encoding]::GetEncoding('iso-8859-1')
$latin1String = $latin1Encoding.GetString($bytes)

# Now decode it properly as UTF-8 by re-encoding to bytes and reading as UTF-8
$utf8Bytes = $latin1Encoding.GetBytes($latin1String)
$fixedString = [System.Text.Encoding]::UTF8.GetString($utf8Bytes)

# Show sample
Write-Host "=== SAMPLE (first 500 chars) ==="
Write-Host $fixedString.Substring(0, [Math]::Min(500, $fixedString.Length))
Write-Host ""
Write-Host "=== Line count: $(($fixedString -split "`n").Count) ==="

# Check if the fix worked (should not have mojibake pattern)
$hasMojibake = $fixedString -match "Ãƒ"
Write-Host "Still has mojibake: $hasMojibake"
