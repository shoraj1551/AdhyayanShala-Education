import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debug() {
    console.log('--- Database Diagnostics ---');

    // Find Shoraj (from screenshot)
    const users = await prisma.user.findMany({
        where: { name: { contains: 'Shoraj', mode: 'insensitive' } }
    });

    if (users.length === 0) {
        console.log('No user found with name "Shoraj"');
        return;
    }

    for (const user of users) {
        console.log(`\nUser: ${user.name} (${user.id})`);
        console.log(`Role: ${user.role}`);
        console.log(`Wallet Balance: ${user.walletBalance}`);
        console.log(`Total Earnings: ${user.totalEarnings}`);

        const courses = await prisma.course.findMany({
            where: { instructorId: user.id },
            include: { _count: { select: { enrollments: true } } }
        });

        console.log(`\nCourses managed by ${user.name}:`);
        for (const course of courses) {
            console.log(`- ${course.title} (ID: ${course.id})`);
            console.log(`  Price: ${course.price}, Discount: ${course.discountedPrice}`);
            console.log(`  Enrollments: ${course._count.enrollments}`);

            const enrols = await prisma.enrollment.findMany({
                where: { courseId: course.id },
                include: { user: { select: { name: true } } }
            });
            for (const en of enrols) {
                console.log(`    * Student: ${en.user.name} (Enrolled: ${en.enrolledAt})`);
            }

            const earnings = await prisma.earningsLedger.findMany({
                where: { courseId: course.id, instructorId: user.id }
            });
            console.log(`  Earnings Records: ${earnings.length}`);
            for (const earn of earnings) {
                console.log(`    * Amount: ${earn.amount}, Type: ${earn.type}, Date: ${earn.createdAt}`);
            }
        }
    }
}

debug()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
