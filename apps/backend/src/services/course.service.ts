
import prisma from '../lib/prisma';
import { CourseLevel } from '@prisma/client';

export const listCourses = async (search?: string) => {
    const where: any = { isPublished: true };

    if (search) {
        where.OR = [
            { title: { contains: search } },
            { description: { contains: search } }
        ];
    }

    return await prisma.course.findMany({
        where,
        include: {
            instructor: {
                select: { name: true, email: true }
            },
            _count: {
                select: { modules: true, tests: true }
            }
        }
    });
};

export const getCourseById = async (courseId: string) => {
    return await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            instructor: {
                select: { name: true }
            },
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: true,
                    tests: true
                }
            },
            tests: true,
            _count: {
                select: { enrollments: true }
            }
        }
    });
};

export const createCourse = async (data: any) => {
    return await prisma.course.create({
        data
    });
};

export const listInstructorCourses = async (instructorId: string) => {
    return await prisma.course.findMany({
        where: { instructorId },
        include: {
            _count: {
                select: { modules: true, tests: true, enrollments: true }
            }
        }
    });
};

export const addModule = async (courseId: string, title: string) => {
    // Get max order
    const lastModule = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' }
    });
    const order = lastModule ? lastModule.order + 1 : 1;

    return await prisma.module.create({
        data: {
            courseId,
            title,
            order
        }
    });
};

export const addLesson = async (moduleId: string, data: {
    title: string,
    type: 'VIDEO' | 'TEXT',
    content: string,
    videoUrl?: string,
    summary?: string,
    attachmentUrl?: string
}) => {
    const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: 'desc' }
    });
    const order = lastLesson ? lastLesson.order + 1 : 1;

    return await prisma.lesson.create({
        data: {
            moduleId,
            title: data.title,
            type: data.type,
            content: data.content,
            videoUrl: data.videoUrl,
            summary: data.summary,
            attachmentUrl: data.attachmentUrl,
            order
        }
    });
};

export const deleteModule = async (id: string) => {
    // Delete lessons first (cascade usually handles this but good to be explicit or rely on schema)
    // Prisma schema doesn't show onDelete: Cascade for Lesson->Module. I should add it or delete manually.
    // Let's delete lessons manually to be safe if cascade isn't set.
    await prisma.lesson.deleteMany({ where: { moduleId: id } });
    return await prisma.module.delete({ where: { id } });
};

export const deleteLesson = async (id: string) => {
    return await prisma.lesson.delete({ where: { id } });
};

export const updateModule = async (id: string, title: string) => {
    return await prisma.module.update({
        where: { id },
        data: { title }
    });
};

export const updateLesson = async (id: string, data: {
    title?: string,
    content?: string,
    type?: string,
    videoUrl?: string,
    summary?: string,
    attachmentUrl?: string
}) => {
    return await prisma.lesson.update({
        where: { id },
        data
    });
};

export const enrollUserInCourse = async (userId: string, courseId: string) => {
    // Check if valid course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error("Course not found");

    // Check existing enrollment
    const existing = await prisma.enrollment.findFirst({
        where: { userId, courseId }
    });
    if (existing) return existing;

    return await prisma.enrollment.create({
        data: {
            userId,
            courseId
        }
    });
}

export const checkEnrollment = async (userId: string, courseId: string) => {
    const enrollment = await prisma.enrollment.findFirst({
        where: { userId, courseId }
    });
    return !!enrollment;
}

export const getCourseProgress = async (userId: string, courseId: string) => {
    const progress = await prisma.lessonProgress.findMany({
        where: {
            userId,
            lesson: {
                module: {
                    courseId
                }
            }
        },
        select: { lessonId: true }
    });
    return progress.map(p => p.lessonId);
}

export const publishCourse = async (courseId: string) => {
    // 1. Update Course
    const course = await prisma.course.update({
        where: { id: courseId },
        data: {
            isPublished: true,
            publishedAt: new Date()
        }
    });

    // 2. Create Announcement
    await prisma.announcement.create({
        data: {
            title: `New Course: ${course.title}`,
            content: `We are excited to announce a new course "${course.title}". Check it out now!`,
            type: "COURSE_LAUNCH"
        }
    });

    // 3. Create Notification (Example: for the instructor, or all users in a real app)
    // For now, just notifying the instructor as a confirmation
    if (course.instructorId) {
        await prisma.notification.create({
            data: {
                userId: course.instructorId,
                title: "Course Published",
                message: `Your course "${course.title}" is now live!`
            }
        });
    }

    return course;
};

export const listAnnouncements = async () => {
    return await prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5 // Latest 5 news
    });
};

export const listNotifications = async (userId: string) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
};

export const markNotificationRead = async (id: string, userId: string) => {
    // Verify ownership implicitly by where clause
    await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true }
    });
};

// --- NOTES LOGIC ---

export const getNote = async (userId: string, lessonId: string) => {
    return prisma.note.findUnique({
        where: {
            userId_lessonId: { userId, lessonId }
        }
    });
}

export const saveNote = async (userId: string, lessonId: string, content: string) => {
    return prisma.note.upsert({
        where: {
            userId_lessonId: { userId, lessonId }
        },
        update: { content },
        create: { userId, lessonId, content }
    });
}

// --- DELETE COURSE WITH OTP LOGIC ---

export const generateDeleteOTP = async (courseId: string, userId: string) => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error("Course not found");
    if (course.instructorId !== userId) throw new Error("Unauthorized");

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Store in User
    await prisma.user.update({
        where: { id: userId },
        data: {
            deleteOtp: otp,
            deleteOtpExpires: expires
        }
    });

    // MOCK EMAIL SENDER
    console.log(`[MOCK EMAIL] OTP for Course Deletion: ${otp} for User ${userId}`);

    return { message: "OTP sent to your email (Check console)" };
};

export const deleteCourseWithOTP = async (courseId: string, userId: string, otp?: string) => {
    // 1. Fetch Course with Enrollment Count
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            _count: {
                select: { enrollments: true }
            }
        }
    });

    if (!course) throw new Error("Course not found");
    if (course.instructorId !== userId) throw new Error("Unauthorized");

    // 2. Check Enrollments & OTP
    const enrollmentCount = course._count.enrollments;

    if (enrollmentCount > 0) {
        // Require OTP only if students are enrolled
        if (!otp) throw new Error("OTP Required for courses with active students.");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        if (user.deleteOtp !== otp) throw new Error("Invalid OTP");
        if (!user.deleteOtpExpires || new Date() > user.deleteOtpExpires) throw new Error("OTP Expired");
    }

    // 3. Proceed to delete (Granular Cleanup)

    // A. Cleanup Modules & Lessons
    const modules = await prisma.module.findMany({
        where: { courseId },
        include: { lessons: true }
    });

    for (const m of modules) {
        // Delete Lesson Progress first
        const lessonIds = m.lessons.map(l => l.id);
        if (lessonIds.length > 0) {
            await prisma.lessonProgress.deleteMany({
                where: { lessonId: { in: lessonIds } }
            });
            // Delete Lessons
            await prisma.lesson.deleteMany({
                where: { moduleId: m.id }
            });
        }
        // Delete Module
        await prisma.module.delete({ where: { id: m.id } });
    }

    // B. Cleanup Tests (Questions, Options, Attempts)
    const tests = await prisma.test.findMany({
        where: { courseId },
        include: { questions: true }
    });

    for (const t of tests) {
        // Delete Attempts
        await prisma.attempt.deleteMany({ where: { testId: t.id } });

        // Delete Questions & Options
        const questionIds = t.questions.map(q => q.id);
        if (questionIds.length > 0) {
            await prisma.option.deleteMany({
                where: { questionId: { in: questionIds } }
            });
            await prisma.question.deleteMany({
                where: { testId: t.id }
            });
        }
        // Delete Test
        await prisma.test.deleteMany({ where: { id: t.id } });
    }

    // C. Cleanup Reviews
    await prisma.review.deleteMany({ where: { courseId } });

    // D. Cleanup Enrollments
    await prisma.enrollment.deleteMany({ where: { courseId } });

    // E. Delete Course
    await prisma.course.delete({ where: { id: courseId } });

    // Clear OTP
    // Clear OTP if it was used
    if (enrollmentCount > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { deleteOtp: null, deleteOtpExpires: null }
        });
    }

    return { message: "Course deleted successfully" };
};
