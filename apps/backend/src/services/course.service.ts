
import prisma from '../lib/prisma';
import { Prisma, CourseLevel } from '@prisma/client';
import Logger from '../lib/logger';

export const listCourses = async (search?: string, excludeInstructorId?: string) => {
    const where: Prisma.CourseWhereInput = {
        isPublished: true,
    };

    where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
    ];

    // Exclude instructor's own courses for market research
    if (excludeInstructorId) {
        where.instructorId = {
            not: excludeInstructorId,
        };
    }

    return await prisma.course.findMany({
        where,
        select: {
            id: true,
            title: true,
            description: true,
            level: true,
            price: true,
            discountedPrice: true,
            type: true,
            isPublished: true,
            createdAt: true,
            instructor: {
                select: { id: true, name: true, email: true }
            },
            _count: {
                select: { enrollments: true, modules: true }
            }
        },
        orderBy: { createdAt: 'desc' }
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
                    lessons: { orderBy: { order: 'asc' } },
                    tests: { orderBy: { order: 'asc' } }
                }
            },
            tests: true,
            _count: {
                select: { enrollments: true }
            }
        }
    });
};

interface CreateCourseDTO {
    title: string;
    description: string;
    level?: CourseLevel;
    price?: number;
    type?: 'VIDEO' | 'LIVE' | 'TEXT';
    instructorId: string;
    isPublished?: boolean;
    // Live Course specifics
    pricePerClass?: number;
    discountedPrice?: number;
    totalClasses?: number;
    startDate?: Date | string;
    endDate?: Date | string;
    meetingPlatform?: string;
    meetingLink?: string;
    schedule?: any; // Keep any for JSON/Complex object if structure is variable, or define strict schedule type if possible. Let's keep strict check but allow flexible schedule for now or defined interface.
    maxStudents?: number;
}

export const createCourse = async (data: CreateCourseDTO) => {
    // Extract and validate pricing data based on course type
    // Using explicit object construction to satisfy Prisma types
    const courseData: Prisma.CourseCreateInput = {
        title: data.title,
        description: data.description,
        level: data.level || 'BEGINNER',
        price: data.price || 0,
        type: data.type || 'VIDEO',
        isPublished: data.isPublished ?? false,
        instructor: { connect: { id: data.instructorId } },

        // Live Course specifics (Defaulting to undefined or null appropriately for optional fields)
        pricePerClass: data.type === 'LIVE' ? data.pricePerClass : undefined,
        discountedPrice: data.type === 'LIVE' ? data.discountedPrice : undefined,
        totalClasses: data.type === 'LIVE' ? data.totalClasses : undefined,
        startDate: data.type === 'LIVE' && data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.type === 'LIVE' && data.endDate ? new Date(data.endDate) : undefined,
        meetingPlatform: data.type === 'LIVE' ? data.meetingPlatform : undefined,
        meetingLink: data.type === 'LIVE' ? data.meetingLink : undefined,
        schedule: data.type === 'LIVE' && data.schedule ? data.schedule : undefined,
        maxStudents: data.type === 'LIVE' ? data.maxStudents : undefined,
    };

    return await prisma.course.create({
        data: courseData
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

export const getInstructorStats = async (instructorId: string) => {
    const courses = await prisma.course.findMany({
        where: { instructorId },
        include: {
            _count: {
                select: { enrollments: true }
            }
        }
    });

    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const totalEnrollments = courses.reduce((sum, course) => sum + course._count.enrollments, 0);
    const totalRevenue = courses.reduce((sum, course) => {
        const courseRevenue = course._count.enrollments * (course.discountedPrice || course.price);
        return sum + courseRevenue;
    }, 0);

    const coursesWithStats = courses.map(course => ({
        id: course.id,
        title: course.title,
        enrollmentCount: course._count.enrollments,
        price: course.discountedPrice || course.price,
        isPublished: course.isPublished,
        type: course.type,
    }));

    return {
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalRevenue,
        courses: coursesWithStats,
    };
};

export const getCourseEnrollments = async (courseId: string, instructorId: string) => {
    // Verify course ownership
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { instructorId: true }
    });

    if (!course || course.instructorId !== instructorId) {
        throw new Error("Course not found or unauthorized");
    }

    // Fetch enrollments
    // Assuming Enrollment has relation to User
    return await prisma.enrollment.findMany({
        where: { courseId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true // User joined since
                }
            }
        },
        orderBy: { enrolledAt: 'desc' }
    });
};

export const addModule = async (courseId: string, title: string, userId: string) => {
    // Verify Access
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error("Course not found");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (course.instructorId !== userId && user?.role !== 'ADMIN') throw new Error("Unauthorized");

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
}, userId: string) => {
    // Verify Access via Module -> Course
    const module = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!module) throw new Error("Module not found");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (module.course.instructorId !== userId && user?.role !== 'ADMIN') throw new Error("Unauthorized");

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

export const deleteModule = async (id: string, userId: string) => {
    // Verify Access
    const module = await prisma.module.findUnique({ where: { id }, include: { course: true } });
    if (!module) throw new Error("Module not found");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (module.course.instructorId !== userId && user?.role !== 'ADMIN') throw new Error("Unauthorized");

    // Delete lessons manually to be safe
    await prisma.lesson.deleteMany({ where: { moduleId: id } });
    return await prisma.module.delete({ where: { id } });
};

export const deleteLesson = async (id: string, userId: string) => {
    // Verify Access
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: { module: { include: { course: true } } } });
    if (!lesson) throw new Error("Lesson not found");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (lesson.module.course.instructorId !== userId && user?.role !== 'ADMIN') throw new Error("Unauthorized");

    return await prisma.lesson.delete({ where: { id } });
};

export const updateModule = async (id: string, title: string, userId: string) => {
    // Verify Access
    const module = await prisma.module.findUnique({ where: { id }, include: { course: true } });
    if (!module) throw new Error("Module not found");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (module.course.instructorId !== userId && user?.role !== 'ADMIN') throw new Error("Unauthorized");

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
}, userId: string) => {
    // Verify Access
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: { module: { include: { course: true } } } });
    if (!lesson) throw new Error("Lesson not found");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (lesson.module.course.instructorId !== userId && user?.role !== 'ADMIN') throw new Error("Unauthorized");

    return await prisma.lesson.update({
        where: { id },
        data
    });
};

export const enrollUserInCourse = async (userId: string, courseId: string) => {
    // Check if valid course and check max enrollments
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { _count: { select: { enrollments: true } } }
    });
    if (!course) throw new Error("Course not found");

    if (course.maxStudents && course._count.enrollments >= course.maxStudents) {
        throw new Error("Course is full");
    }

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

export const checkGuestEnrollmentLimit = async (userId: string) => {
    const count = await prisma.enrollment.count({
        where: { userId }
    });
    return count < 2;
};

// 2FA for Unpublish
export const unpublishCourseWithOTP = async (courseId: string, userId: string, otp?: string) => {
    const course = await prisma.course.findUnique({ where: { id: courseId }, include: { _count: { select: { enrollments: true } } } });
    if (!course) throw new Error("Course not found");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    Logger.info(`[Unpublish] CourseId: ${courseId}, UserId: ${userId}, Role: ${user.role}, Enrollments: ${course._count.enrollments}`);

    if (course.instructorId !== userId && user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    if (course._count.enrollments > 0 && user.role !== 'ADMIN') {
        if (!otp) throw new Error("OTP Required to unpublish active course.");
        if (user.deleteOtp !== otp) throw new Error("Invalid OTP");
        if (!user.deleteOtpExpires || new Date() > user.deleteOtpExpires) throw new Error("OTP Expired");
    }

    if (course._count.enrollments > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { deleteOtp: null, deleteOtpExpires: null }
        });
    }

    return await prisma.course.update({
        where: { id: courseId },
        data: { isPublished: false }
    });
};

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

export const publishCourse = async (courseId: string, userId?: string) => {
    // Check override
    if (userId) {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (course) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (course.instructorId !== userId && user?.role !== 'ADMIN') throw new Error("Unauthorized");
        }
    }

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

// unpublishCourse replaced by unpublishCourseWithOTP
export const unpublishCourse = async (courseId: string) => {
    // Legacy support or internal use
    return await prisma.course.update({
        where: { id: courseId },
        data: { isPublished: false }
    });
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

    // Check permissions
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (course.instructorId !== userId && user.role !== 'ADMIN') throw new Error("Unauthorized");

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
    Logger.info(`[MOCK EMAIL] OTP for Course Deletion: ${otp} for User ${userId}`);

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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (course.instructorId !== userId && user.role !== 'ADMIN') throw new Error("Unauthorized");

    // 2. Check Enrollments & OTP
    const enrollmentCount = course._count.enrollments;

    if (enrollmentCount > 0 && user.role !== 'ADMIN') {
        // Require OTP only if students are enrolled
        if (!otp) throw new Error("OTP Required for courses with active students.");

        const userCheck = await prisma.user.findUnique({ where: { id: userId } });
        // user is already fetched above, but keeping logic consistent if needed or reusing 'user' var

        if (user.deleteOtp !== otp) throw new Error("Invalid OTP");
        if (!user.deleteOtpExpires || new Date() > user.deleteOtpExpires) throw new Error("OTP Expired");
    }

    // 3. Proceed to delete (Granular Cleanup - Batch Optimized)

    // A. Cleanup Modules, Lessons, Progress, Comments, Notes
    const modules = await prisma.module.findMany({ where: { courseId }, select: { id: true } });
    const moduleIds = modules.map(m => m.id);

    if (moduleIds.length > 0) {
        const lessons = await prisma.lesson.findMany({ where: { moduleId: { in: moduleIds } }, select: { id: true } });
        const lessonIds = lessons.map(l => l.id);

        if (lessonIds.length > 0) {
            // Delete dependencies of Lessons
            await prisma.lessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
            await prisma.lessonComment.deleteMany({ where: { lessonId: { in: lessonIds } } });

            // Notes have Cascade usually, but safe to delete explicit if unsure of schema history
            // Standardizing manual delete to ensure consistency
            await prisma.note.deleteMany({ where: { lessonId: { in: lessonIds } } });

            // Delete Lessons
            await prisma.lesson.deleteMany({ where: { moduleId: { in: moduleIds } } });
        }
        // Delete Modules
        await prisma.module.deleteMany({ where: { courseId } });
    }

    // B. Cleanup Tests (Questions, Options, Attempts)
    const tests = await prisma.test.findMany({ where: { courseId }, select: { id: true } });
    const testIds = tests.map(t => t.id);

    if (testIds.length > 0) {
        // Delete Attempts
        await prisma.attempt.deleteMany({ where: { testId: { in: testIds } } });

        // Delete Questions & Options
        const questions = await prisma.question.findMany({ where: { testId: { in: testIds } }, select: { id: true } });
        const questionIds = questions.map(q => q.id);

        if (questionIds.length > 0) {
            await prisma.option.deleteMany({ where: { questionId: { in: questionIds } } });
            await prisma.question.deleteMany({ where: { testId: { in: testIds } } });
        }
        // Delete Tests
        await prisma.test.deleteMany({ where: { courseId } });
    }

    // C. Cleanup Reviews
    await prisma.review.deleteMany({ where: { courseId } });

    // D. Cleanup Enrollments
    await prisma.enrollment.deleteMany({ where: { courseId } });

    // E. Cleanup Payments (Required for Hard Delete due to FK)
    await prisma.payment.deleteMany({ where: { courseId } });

    // F. Cleanup EarningLedgers (If linked)
    // Checking schema... EarningsLedger has courseId? Yes.
    await prisma.earningsLedger.deleteMany({ where: { courseId } });

    // G. Delete Course
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
