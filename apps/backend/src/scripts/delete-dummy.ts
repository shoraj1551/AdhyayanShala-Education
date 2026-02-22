
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Delete courses with empty titles or specific IDs if needed
    // Based on previous output, 2 courses had empty titles.
    // Get IDs of dummy courses
    const dummyCourses = await prisma.course.findMany({
        where: {
            OR: [
                { title: '' },
                { title: 'Test Course' }
            ]
        },
        select: { id: true }
    });

    const courseIds = dummyCourses.map(c => c.id);
    console.log(`Found ${courseIds.length} dummy courses to delete: ${courseIds.join(', ')}`);

    if (courseIds.length === 0) return;

    // Granular Cleanup (Cascade Manually)

    // 1. Modules & Lessons
    const modules = await prisma.module.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } });
    const moduleIds = modules.map(m => m.id);

    if (moduleIds.length > 0) {
        const lessons = await prisma.lesson.findMany({ where: { moduleId: { in: moduleIds } }, select: { id: true } });
        const lessonIds = lessons.map(l => l.id);

        if (lessonIds.length > 0) {
            await prisma.lessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
            await prisma.lessonComment.deleteMany({ where: { lessonId: { in: lessonIds } } });
            await prisma.note.deleteMany({ where: { lessonId: { in: lessonIds } } });
            await prisma.lesson.deleteMany({ where: { moduleId: { in: moduleIds } } });
        }
        await prisma.module.deleteMany({ where: { courseId: { in: courseIds } } });
    }

    // 2. Tests & Questions
    const tests = await prisma.test.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } });
    const testIds = tests.map(t => t.id);

    if (testIds.length > 0) {
        await prisma.attempt.deleteMany({ where: { testId: { in: testIds } } });
        const questions = await prisma.question.findMany({ where: { testId: { in: testIds } }, select: { id: true } });
        const questionIds = questions.map(q => q.id);
        if (questionIds.length > 0) {
            await prisma.option.deleteMany({ where: { questionId: { in: questionIds } } });
            await prisma.question.deleteMany({ where: { testId: { in: testIds } } });
        }
        await prisma.test.deleteMany({ where: { courseId: { in: courseIds } } });
    }

    // 3. Other dependencies
    await prisma.review.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.enrollment.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.payment.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.earningsLedger.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.learningPath.deleteMany({ where: { courses: { some: { id: { in: courseIds } } } } }); // Need to check if this is right for implicit many-to-many... actually explicit relation in schema?
    // Schema says: courses Course[] @relation("PathCourses"). Implicit m-n.
    // Deleting course will automatically remove entry from join table in Prisma usually, or we might fail.
    // For implicit m-n, deleting the record is usually fine.

    // 4. Delete Course
    const deleted = await prisma.course.deleteMany({
        where: { id: { in: courseIds } }
    });

    console.log(`Successfully deleted ${deleted.count} dummy courses.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
