
import { PrismaClient, CourseLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Creating Demo Course...");
    const instructor = await prisma.user.findUnique({
        where: { email: 'instructor@shoraj.com' }
    });

    if (!instructor) {
        throw new Error("Instructor not found");
    }

    const course = await prisma.course.create({
        data: {
            title: 'Statistics Foundations (Demo)',
            description: 'A demo course created for testing.',
            level: CourseLevel.BEGINNER,
            price: 0,
            isPublished: true,
            instructorId: instructor.id,
            modules: {
                create: [
                    {
                        title: 'Getting Started',
                        order: 1,
                        lessons: {
                            create: [
                                { title: 'Welcome', type: 'TEXT', content: 'Hello World', duration: 5 }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log(`SUCCESS: Created Course '${course.title}' (ID: ${course.id})`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
