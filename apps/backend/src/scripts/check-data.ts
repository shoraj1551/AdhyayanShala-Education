
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            instructor: {
                select: { email: true }
            }
        }
    });

    console.log('--- COURSES IN DB ---');
    console.log(JSON.stringify(courses, null, 2));
    console.log('--- END COURSES ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
