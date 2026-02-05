
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- PRODUCTION DB VERIFICATION ---')
  console.log('Connecting to database...')
  try {
    await prisma.$connect()
    console.log('✅ Connection established.')

    // Count Users
    const userCount = await prisma.user.count()
    console.log(`✅ Users found: ${userCount}`)

    // Count Courses
    const courseCount = await prisma.course.count()
    console.log(`✅ Courses found: ${courseCount}`)

    if (userCount === 0 && courseCount === 0) {
        console.log('⚠️ Database is connected but EMPTY (No users or courses).')
    } else {
        console.log('🎉 DATA EXISTS! The database is populated.')
        
        // Show one reference
        const u = await prisma.user.findFirst()
        console.log('Sample User Email:', u?.email)
    }

  } catch (e) {
    console.error('❌ Connection Verification Failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
