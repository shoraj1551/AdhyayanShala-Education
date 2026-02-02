# Database Migration Safety Guide

## ⚠️ CRITICAL: Preventing Data Loss

### Before ANY Schema Changes

1. **Always backup your database first:**

   ```bash
   # SQLite backup
   cp apps/backend/prisma/dev.db apps/backend/prisma/dev.db.backup
   
   # Or use timestamp
   cp apps/backend/prisma/dev.db apps/backend/prisma/dev.db.$(date +%Y%m%d_%H%M%S)
   ```

2. **Use migrations instead of db push:**

   ```bash
   # ❌ NEVER use in production (resets data)
   npx prisma db push
   
   # ✅ ALWAYS use migrations (preserves data)
   npx prisma migrate dev --name descriptive_name
   ```

3. **Test migrations on a copy first:**
   - Copy your database
   - Run migration on the copy
   - Verify data integrity
   - Then apply to production

### Migration Workflow

```bash
# 1. Backup database
cp apps/backend/prisma/dev.db apps/backend/prisma/dev.db.backup

# 2. Create migration
cd apps/backend
npx prisma migrate dev --name add_new_field

# 3. Verify data is intact
npx prisma studio

# 4. If something goes wrong, restore backup
cp apps/backend/prisma/dev.db.backup apps/backend/prisma/dev.db
```

### Restoring Data

If you lose data, you can restore from:

1. **Backup file** (if you created one)
2. **Seed script** (recreates sample data)

   ```bash
   npx tsx prisma/seed.ts
   ```

### Production Best Practices

1. **Never run `prisma db push` in production**
2. **Always use `prisma migrate deploy` for production**
3. **Test migrations in staging first**
4. **Keep regular database backups**
5. **Version control your migration files**

### Current Seed Script

Run this anytime to restore sample data:

```bash
cd apps/backend
npx tsx prisma/seed.ts
```

This creates:

- Your instructor account (<shorajtomer@gmail.com>)
- Sample pre-recorded course with modules/lessons
- Sample live course with pricing and schedules
- Test student account
