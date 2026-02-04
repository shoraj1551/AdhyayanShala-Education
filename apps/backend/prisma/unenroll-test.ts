
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const courseTitle = "Advanced Enrollment Testing with Payment Plans";
    console.log(`Finding course: "${courseTitle}"...`);

    const course = await prisma.course.findFirst({
        where: { title: courseTitle }
    });

    if (!course) {
        console.error(`Course "${courseTitle}" not found.`);
        return;
    }

    console.log(`Found course ID: ${course.id}. Removing all enrollments...`);

    const deleteResult = await prisma.enrollment.deleteMany({
        where: {
            courseId: course.id
        }
    });

    console.log(`Successfully removed ${deleteResult.count} enrollments.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
