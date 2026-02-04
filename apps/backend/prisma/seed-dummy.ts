
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding dummy course...');

    // Find an instructor (or create one using standard user)
    const instructor = await prisma.user.findFirst({
        where: { role: 'INSTRUCTOR' }
    }) || await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!instructor) {
        console.error('No instructor found to assign course to.');
        process.exit(1);
    }

    const course = await prisma.course.create({
        data: {
            title: "Advanced Enrollment Testing with Payment Plans",
            description: "This is a dummy course created to test the new enrollment modal, user details form, and payment plan selection logic. It has a price to demonstrate the discounts.",
            level: "ADVANCED",
            price: 5000,
            discountedPrice: 4000, // 4000 base -> Plans applied on this
            type: "VIDEO",
            isPublished: true,
            instructorId: instructor.id,
            modules: {
                create: [
                    {
                        title: "Introduction",
                        order: 1,
                        lessons: {
                            create: [
                                {
                                    title: "Welcome to the Course",
                                    content: "This is a sample lesson.",
                                    type: "VIDEO",
                                    order: 1
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log(`Dummy course created: ${course.title} (ID: ${course.id})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
