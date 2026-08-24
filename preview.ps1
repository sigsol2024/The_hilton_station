# Local preview — same /assets and /js paths as the live site.
# Run from the project folder:  .\preview.ps1
# Then open http://localhost:8000
Set-Location $PSScriptRoot
npx --yes serve . -l 8000
