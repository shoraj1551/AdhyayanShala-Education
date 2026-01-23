
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Courses...");
    const courses = await prisma.course.findMany();
    console.log(`Found ${courses.length} courses.`);

    const instructor = await prisma.user.findUnique({
        where: { email: 'instructor@shoraj.com' }
    });

    if (!instructor) {
        console.error("Instructor not found!");
        return;
    }

    console.log(`Assigning courses to Instructor ID: ${instructor.id}`);

    // Update all courses to belong to this instructor
    const result = await prisma.course.updateMany({
        data: {
            instructorId: instructor.id
        }
    });

    console.log(`Updated ${result.count} courses.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
