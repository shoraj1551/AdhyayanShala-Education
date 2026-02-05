# migrate_production.ps1
# Script to automate Prisma Migration to Production (Supabase)
# UPDATED: Solves P3019 (SQLite vs Postgres mismatch) by using 'db push'

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   PRODUCTION DATABASE MIGRATION HELPER   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will push your schema to Supabase."
Write-Host "NOTE: This uses 'db push' to bypass old SQLite migration history."
Write-Host ""
Write-Host "1. Enter your Supabase 'Transaction' URL."
Write-Host "   (postgres://postgres.[ref]:[password]@aws-0-...pooler.supabase.com:6543/postgres)"

# 1. Prompt for URL
$supabaseUrl = Read-Host -Prompt "Supabase Connection String"

if ([string]::IsNullOrWhiteSpace($supabaseUrl)) {
    Write-Host "Error: No URL provided. Exiting." -ForegroundColor Red
    exit 1
}

# 2. Set Env Var for current session
$env:DATABASE_URL = $supabaseUrl

# 3. Handle Old SQLite Migrations (The cause of P3019)
if (Test-Path "apps/backend/prisma/migrations") {
    Write-Host "Found old migration history. Renaming to avoid conflicts..." -ForegroundColor Yellow
    Rename-Item "apps/backend/prisma/migrations" "migrations_backup_sqlite" -ErrorAction SilentlyContinue
    Write-Host "Renamed 'migrations' to 'migrations_backup_sqlite'" -ForegroundColor Gray
}

# 4. Push Schema (Force Sync)
Write-Host ""
Write-Host "Running 'npx prisma db push'..." -ForegroundColor Yellow
Write-Host "This will create/update tables in Supabase directly."
try {
    cd apps/backend
    # --accept-data-loss allows overwriting if there are conflicts, safe for fresh DB
    npx prisma db push --accept-data-loss
}
catch {
    Write-Host "Schema Push Failed!" -ForegroundColor Red
    Write-Host $_
    cd ../..
    exit 1
}

Write-Host ""
Write-Host "✅ Schema Synced Successfully!" -ForegroundColor Green
Write-Host ""

# 5. Optional Seed
$doSeed = Read-Host -Prompt "Run SEED script (create initial admin/data)? (y/n)"
if ($doSeed -eq 'y') {
    Write-Host "Running 'npx prisma db seed'..." -ForegroundColor Yellow
    try {
        npx prisma db seed
        Write-Host "✅ Seeding Successful!" -ForegroundColor Green
    }
    catch {
        Write-Host "Seeding Failed." -ForegroundColor Red
        Write-Host $_
    }
}

# 6. Cleanup
cd ../..
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   DONE! Database is Ready.               " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
pause
