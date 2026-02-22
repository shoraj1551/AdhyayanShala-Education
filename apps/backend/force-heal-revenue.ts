import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Shared logic from finance.service.ts
const recordCourseSale = async (tx: any, instructorId: string, courseId: string, amount: number) => {
    const share = amount * 0.70;
    await tx.user.update({
        where: { id: instructorId },
        data: {
            walletBalance: { increment: share },
            totalEarnings: { increment: share }
        }
    });

    await tx.earningsLedger.create({
        data: {
            instructorId,
            courseId,
            amount: share,
            type: 'COURSE_SALE',
            description: 'Course Enrollment Revenue (Recovered)'
        }
    });
};

async function forceHeal() {
    const instructorId = '71eca2a7-fc61-4b3d-8592-03068441e95b'; // From diagnostics
    console.log(`Forcing revenue recovery for instructor: ${instructorId}`);

    const enrollments = await prisma.enrollment.findMany({
        where: { course: { instructorId } },
        include: { course: true }
    });

    const existingEarnings = await prisma.earningsLedger.findMany({
        where: { instructorId, type: 'COURSE_SALE' },
        select: { courseId: true }
    });

    const earningsCounts: Record<string, number> = {};
    for (const e of existingEarnings) {
        if (e.courseId) earningsCounts[e.courseId] = (earningsCounts[e.courseId] || 0) + 1;
    }

    const enrollmentCounts: Record<string, number> = {};
    for (const en of enrollments) {
        enrollmentCounts[en.courseId] = (enrollmentCounts[en.courseId] || 0) + 1;
    }

    await prisma.$transaction(async (tx) => {
        for (const courseId in enrollmentCounts) {
            const missing = enrollmentCounts[courseId] - (earningsCounts[courseId] || 0);
            if (missing > 0) {
                const course = enrollments.find(e => e.courseId === courseId)?.course;
                if (course && (course.price > 0 || (course.discountedPrice || 0) > 0)) {
                    const amount = course.discountedPrice || course.price;
                    console.log(`Crediting ${missing} sales for course "${course.title}" at amount ₹${amount}`);
                    for (let i = 0; i < missing; i++) {
                        await recordCourseSale(tx, instructorId, courseId, amount);
                    }
                }
            }
        }
    });

    console.log('Recovery script finished.');
}

forceHeal()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
