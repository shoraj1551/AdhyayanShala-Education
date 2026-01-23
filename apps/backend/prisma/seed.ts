import { PrismaClient, CourseLevel, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Instructor
    const instructorPassword = await bcrypt.hash('instructor123', 10);
    const instructor = await prisma.user.upsert({
        where: { email: 'instructor@shoraj.com' },
        update: {},
        create: {
            email: 'instructor@shoraj.com',
            name: 'Dr. Jane Stats',
            password: instructorPassword,
            role: Role.INSTRUCTOR,
        },
    });

    // 2. Create Course
    const course = await prisma.course.create({
        data: {
            title: 'Statistics Foundations',
            description: 'Master the fundamentals of statistics, probability, and data analysis. Perfect for beginners.',
            level: CourseLevel.BEGINNER,
            price: 0,
            isPublished: true,
            instructorId: instructor.id,
            modules: {
                create: [
                    {
                        title: 'Introduction to Probability',
                        order: 1,
                        lessons: {
                            create: [
                                { title: 'What is Probability?', content: 'Probability is the measure of the likelihood that an event will occur.', type: 'TEXT', duration: 10 },
                                { title: 'Independent vs Dependent Events', content: 'Events are independent if the occurrence of one does not affect the probability of the other.', type: 'TEXT', duration: 15 }
                            ]
                        }
                    },
                    {
                        title: 'Descriptive Statistics',
                        order: 2,
                        lessons: {
                            create: [
                                { title: 'Mean, Median, Mode', content: 'Measures of central tendency.', type: 'TEXT', duration: 12 },
                                { title: 'Variance and Standard Deviation', content: 'Measures of spread.', type: 'TEXT', duration: 20 }
                            ]
                        }
                    }
                ]
            }
        }
    }
    });

console.log(`Created course with ID: ${course.id}`);

// 3. Create a Test for the Course
await prisma.test.create({
    data: {
        title: 'Probability Basics Quiz',
        courseId: course.id,
        questions: {
            create: [
                {
                    text: 'What is the probability of flipping a fair coin and getting heads?',
                    type: 'MCQ',
                    explanation: 'A fair coin has 2 sides, so 1/2 = 0.5',
                    options: {
                        create: [
                            { text: '0.5', isCorrect: true },
                            { text: '0.25', isCorrect: false },
                            { text: '1.0', isCorrect: false }
                        ]
                    }
                },
                {
                    text: 'If P(A) = 0.4 and P(B) = 0.3, and they are independent, what is P(A and B)?',
                    type: 'MCQ',
                    explanation: 'For independent events, P(A and B) = P(A) * P(B) = 0.4 * 0.3 = 0.12',
                    options: {
                        create: [
                            { text: '0.7', isCorrect: false },
                            { text: '0.12', isCorrect: true },
                            { text: '0.1', isCorrect: false }
                        ]
                    }
                }
            ]
        }
    }
});

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
