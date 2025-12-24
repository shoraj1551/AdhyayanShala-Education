import prisma from '../src/lib/prisma';
import { CourseLevel } from '@prisma/client';

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Instructor (Shoraj)
    const instructor = await prisma.user.upsert({
        where: { email: 'shoraj@shorajtomer.me' },
        update: {},
        create: {
            email: 'shoraj@shorajtomer.me',
            name: 'Shoraj Tomer',
            password: 'hashed-password-placeholder', // In real app, hash this
            role: 'INSTRUCTOR'
        }
    });

    // 2. Create MVP Flagship Course: Statistics Foundations
    const course = await prisma.course.create({
        data: {
            title: 'Statistics Foundations',
            description: 'Build intuition for distributions, uncertainty, and probability.',
            level: CourseLevel.BEGINNER,
            isPublished: true,
            instructorId: instructor.id,
            price: 0, // Free for MVP
            modules: {
                create: [
                    {
                        title: '1. Why Statistics Matters',
                        order: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'The Philosophy of Uncertainty',
                                    content: 'Statistics is not about formulas. It is about quantifying what we do not know...',
                                    type: 'TEXT',
                                    duration: 10
                                },
                                {
                                    title: 'Parameters vs Statistics',
                                    content: 'https://www.youtube.com/watch?v=placeholder', // Placeholder video
                                    type: 'VIDEO',
                                    duration: 15
                                }
                            ]
                        }
                    },
                    {
                        title: '2. Thinking in Distributions',
                        order: 2,
                        lessons: {
                            create: [
                                {
                                    title: 'Visualizing Data',
                                    content: 'Histograms, Box plots, and why averages lie.',
                                    type: 'TEXT',
                                    duration: 12
                                }
                            ]
                        }
                    }
                ]
            },
            tests: {
                create: [
                    {
                        title: 'Concept Check: Uncertainty',
                        questions: {
                            create: [
                                {
                                    text: 'Why do we calculate variance instead of just average distance?',
                                    type: 'MCQ',
                                    points: 5,
                                    explanation: 'Variance penalizes outliers by squaring the distance. Average distance (MAD) treats all deviations linearly.',
                                    options: {
                                        create: [
                                            { text: 'To make the numbers bigger', isCorrect: false },
                                            { text: 'To penalize large deviations more heavily', isCorrect: true },
                                            { text: 'It is easier to calculate manually', isCorrect: false }
                                        ]
                                    }
                                },
                                {
                                    text: 'If the mean is 10 and a value is 14, what is the deviation?',
                                    type: 'MCQ', // Treating as MCQ for simplicity in MVP, could be Numerical
                                    points: 5,
                                    explanation: 'Deviation = Value - Mean. 14 - 10 = 4.',
                                    options: {
                                        create: [
                                            { text: '4', isCorrect: true },
                                            { text: '-4', isCorrect: false },
                                            { text: '1.4', isCorrect: false }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log(`✅ Created course: ${course.title} with ID: ${course.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
