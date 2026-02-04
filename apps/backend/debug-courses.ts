
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Users ---");
    const users = await prisma.user.findMany({
        where: { role: 'INSTRUCTOR' },
        select: { id: true, name: true, email: true, _count: { select: { courses: true } } }
    });
    console.table(users);

    console.log("\n--- Courses ---");
    const courses = await prisma.course.findMany({
        select: { id: true, title: true, instructorId: true, instructor: { select: { name: true } } }
    });
    console.table(courses);

    // Check for orphaned courses (instructorId not in users)
    const orphans = courses.filter(c => !c.instructorId);
    if (orphans.length > 0) {
        console.log("\n!!! ORPHAN COURSES FOUND (No Instructor ID) !!!");
        console.table(orphans);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
