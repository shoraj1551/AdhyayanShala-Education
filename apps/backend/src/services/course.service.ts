import prisma from '../lib/prisma';
import CacheService from './cache.service';
import { Prisma, CourseLevel } from '@prisma/client';
import { randomInt } from 'node:crypto';
import Logger from '../lib/logger';
import {
    NotFoundError,
    UnauthorizedError,
    BadRequestError
} from '../lib/errors';
import {
    verifyCourseOwnership,
    verifyModuleOwnership,
    verifyLessonOwnership,
    verifyTestOwnership
} from '../utils/auth-helpers';

export const listCourses = async (search?: string, excludeInstructorId?: string) => {
    const cacheKey = `courses_list_${search || 'all'}_${excludeInstructorId || 'none'}`;
    const cached = await CacheService.get<any>(cacheKey);
    if (cached) return cached;

    const where: Prisma.CourseWhereInput = {
        isPublished: true,
    };

    if (search && search.trim() !== '') {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Exclude instructor's own courses for market research
    if (excludeInstructorId) {
        where.instructorId = {
            not: excludeInstructorId,
        };
    }

    const courses = await prisma.course.findMany({
        where,
        select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
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

    // Cache for 2 minutes (120 seconds) - listings change more frequently
    await CacheService.set(cacheKey, courses, 120);
    return courses;
};

export const getCourseById = async (courseId: string) => {
    return await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            instructor: {
                select: { name: true, id: true, email: true, avatar: true, bio: true }
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
    type?: 'VIDEO' | 'LIVE' | 'TEXT' | 'TEST_SERIES';
    instructorId: string;
    isPublished?: boolean;
    isFree?: boolean; // New field
    // Live Course specifics
    pricePerClass?: number;
    discountedPrice?: number;
    totalClasses?: number;
    startDate?: Date | string;
    endDate?: Date | string;
    meetingPlatform?: string;
    meetingLink?: string;
    schedule?: string;
    maxStudents?: number;
    thumbnailUrl?: string;
    promoVideoUrl?: string;
    brochureUrl?: string;
    currency?: string;
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
        isFree: data.isFree ?? false, // Mapped new field
        instructor: { connect: { id: data.instructorId } },

        // Live Course specifics (Defaulting to undefined or null appropriately for optional fields)
        pricePerClass: data.type === 'LIVE' ? data.pricePerClass : undefined,
        discountedPrice: data.type === 'LIVE' ? data.discountedPrice : undefined,
        totalClasses: data.type === 'LIVE' ? data.totalClasses : undefined,
        startDate: (data.type === 'LIVE' || data.type === 'TEST_SERIES') && data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.type === 'LIVE' && data.endDate ? new Date(data.endDate) : undefined,
        maxStudents: data.type === 'LIVE' ? data.maxStudents : undefined,
        thumbnailUrl: data.thumbnailUrl,
        promoVideoUrl: data.promoVideoUrl,
        brochureUrl: data.brochureUrl,
        currency: data.currency || 'INR',
    };

    const course = await prisma.course.create({
        data: courseData
    });

    // Handle LIVE course settings
    if (data.type === 'LIVE') {
        const { initializeSettings } = await import('./liveClass.service');
        await initializeSettings(course.id, data.meetingPlatform || 'Jitsi', data.schedule);
    }

    return course;
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
    const user = await prisma.user.findUnique({
        where: { id: instructorId },
        select: { totalEarnings: true, walletBalance: true }
    });

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
    const totalRevenue = user?.totalEarnings || 0;

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

export const getInstructorDashboardData = async (instructorId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: instructorId },
        select: { totalEarnings: true, walletBalance: true }
    });

    // 1. Fetch all courses for the instructor
    const courses = await prisma.course.findMany({
        where: { instructorId },
        include: {
            liveSettings: true,
            _count: {
                select: { enrollments: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const totalEnrollments = courses.reduce((sum, course) => sum + course._count.enrollments, 0);
    const totalRevenue = user?.totalEarnings || 0;
    const walletBalance = user?.walletBalance || 0;

    // 2. Format Active Courses (Published)
    const activeCourses = courses
        .filter(c => c.isPublished)
        .map(course => ({
            id: course.id,
            title: course.title,
            thumbnailUrl: course.thumbnailUrl,
            enrollmentCount: course._count.enrollments,
            price: course.discountedPrice || course.price,
            type: course.type,
            createdAt: course.createdAt,
        }));

    // 3. Find Upcoming LIVE Classes
    const upcomingClasses = courses
        .filter(c => c.type === 'LIVE' && c.isPublished)
        .map(c => ({
            id: c.id,
            title: c.title,
            thumbnailUrl: c.thumbnailUrl,
            startDate: c.startDate,
            schedule: c.liveSettings?.scheduleNote,
            meetingPlatform: c.liveSettings?.platform,
            meetingLink: c.liveSettings?.meetingLink,
        }))
        .slice(0, 5);

    // 4. Fetch Recent Enrollments across all instructor's courses
    const courseIds = courses.map(c => c.id);
    const recentEnrollments = await prisma.enrollment.findMany({
        where: {
            courseId: { in: courseIds }
        },
        include: {
            user: { select: { name: true, email: true, avatar: true } },
            course: { select: { title: true } }
        },
        orderBy: { enrolledAt: 'desc' },
        take: 10
    });

    const formattedRecentEnrollments = recentEnrollments.map(e => ({
        id: e.id,
        user: {
            name: e.user.name || 'Unknown User',
            email: e.user.email,
            avatar: e.user.avatar,
        },
        courseTitle: e.course.title,
        enrolledAt: e.enrolledAt,
    }));

    // 5. Fetch Upcoming Mentorship Bookings
    const upcomingMentorship = await prisma.mentorshipBooking.findMany({
        where: {
            instructorId,
            status: 'CONFIRMED',
            date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        },
        include: {
            student: { select: { name: true, avatar: true, email: true } }
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        take: 5
    });

    const formattedMentorship = upcomingMentorship.map(m => ({
        id: m.id,
        studentName: m.student.name || 'Student',
        studentAvatar: m.student.avatar,
        date: m.date,
        startTime: m.startTime,
        duration: m.duration,
        meetingLink: `https://${process.env.JITSI_DOMAIN || 'meet.jit.si'}/mentorship-${m.id}`
    }));

    return {
        stats: {
            totalCourses,
            publishedCourses,
            totalEnrollments,
            totalRevenue,
            walletBalance
        },
        activeCourses,
        upcomingClasses,
        recentEnrollments: formattedRecentEnrollments,
        upcomingMentorship: formattedMentorship
    };
};

export const getCourseEnrollments = async (courseId: string, instructorId: string) => {
    // Verify course ownership
    await verifyCourseOwnership(courseId, instructorId);

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
    await verifyCourseOwnership(courseId, userId);

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
    attachmentUrl?: string,
    resources?: Prisma.InputJsonValue
}, userId: string) => {
    // Verify Access via Module -> Course
    await verifyModuleOwnership(moduleId, userId);

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
            resources: data.resources,
            order
        }
    });
};

export const deleteModule = async (id: string, userId: string) => {
    // Verify Access
    await verifyModuleOwnership(id, userId);

    // Delete lessons manually to be safe
    await prisma.lesson.deleteMany({ where: { moduleId: id } });
    return await prisma.module.delete({ where: { id } });
};

export const deleteLesson = async (id: string, userId: string) => {
    // Verify Access
    await verifyLessonOwnership(id, userId);

    return await prisma.lesson.delete({ where: { id } });
};

export const updateModule = async (id: string, title: string, userId: string) => {
    // Verify Access
    await verifyModuleOwnership(id, userId);

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
    attachmentUrl?: string,
    resources?: Prisma.InputJsonValue
}, userId: string) => {
    // Verify Access
    await verifyLessonOwnership(id, userId);

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
    if (!course) throw new NotFoundError("Course");

    if (course.maxStudents && course._count.enrollments >= course.maxStudents) {
        throw new BadRequestError("Course is full");
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
    if (!course) throw new NotFoundError("Course");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");

    Logger.info(`[Unpublish] CourseId: ${courseId}, UserId: ${userId}, Role: ${user.role}, Enrollments: ${course._count.enrollments} `);

    if (course.instructorId !== userId && user.role !== 'ADMIN') {
        throw new UnauthorizedError();
    }

    if (course._count.enrollments > 0 && user.role !== 'ADMIN') {
        if (!otp) throw new BadRequestError("OTP Required to unpublish active course.");
        if (user.deleteOtp !== otp) throw new UnauthorizedError("Invalid OTP");
        if (!user.deleteOtpExpires || new Date() > user.deleteOtpExpires) throw new BadRequestError("OTP Expired");
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
        await verifyCourseOwnership(courseId, userId);
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
            title: `New Course: ${course.title} `,
            content: `We are excited to announce a new course "${course.title}".Check it out now!`,
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
    await verifyCourseOwnership(courseId, userId);

    // Generate cryptographically secure 6-digit OTP
    const otp = randomInt(100000, 1000000).toString();
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

    if (!course) throw new NotFoundError("Course");

    const { user } = await verifyCourseOwnership(courseId, userId);

    // 2. Check Enrollments & OTP
    const enrollmentCount = course._count.enrollments;

    if (enrollmentCount > 0 && user.role !== 'ADMIN') {
        // Require OTP only if students are enrolled
        if (!otp) throw new BadRequestError("OTP Required for courses with active students.");

        const userCheck = await prisma.user.findUnique({ where: { id: userId } });
        // user is already fetched above, but keeping logic consistent if needed or reusing 'user' var

        if (user.deleteOtp !== otp) throw new UnauthorizedError("Invalid OTP");
        if (!user.deleteOtpExpires || new Date() > user.deleteOtpExpires) throw new BadRequestError("OTP Expired");
    }

    // 3. Proceed to delete (Granular Cleanup - Batch Optimized within Transaction)
    await prisma.$transaction(async (tx) => {
        // A. Cleanup Modules, Lessons, Progress, Comments, Notes
        const modules = await tx.module.findMany({ where: { courseId }, select: { id: true } });
        const moduleIds = modules.map(m => m.id);

        if (moduleIds.length > 0) {
            const lessons = await tx.lesson.findMany({ where: { moduleId: { in: moduleIds } }, select: { id: true } });
            const lessonIds = lessons.map(l => l.id);

            if (lessonIds.length > 0) {
                await tx.lessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
                await tx.lessonComment.deleteMany({ where: { lessonId: { in: lessonIds } } });
                await tx.note.deleteMany({ where: { lessonId: { in: lessonIds } } });
                await tx.lesson.deleteMany({ where: { moduleId: { in: moduleIds } } });
            }
            await tx.module.deleteMany({ where: { courseId } });
        }

        // B. Cleanup Tests (Questions, Options, Attempts)
        const tests = await tx.test.findMany({ where: { courseId }, select: { id: true } });
        const testIds = tests.map(t => t.id);

        if (testIds.length > 0) {
            await tx.attempt.deleteMany({ where: { testId: { in: testIds } } });
            const questions = await tx.question.findMany({ where: { testId: { in: testIds } }, select: { id: true } });
            const questionIds = questions.map(q => q.id);

            if (questionIds.length > 0) {
                await tx.option.deleteMany({ where: { questionId: { in: questionIds } } });
                await tx.question.deleteMany({ where: { testId: { in: testIds } } });
            }
            await tx.test.deleteMany({ where: { courseId } });
        }

        // C-G. Cleanup other relations
        await tx.review.deleteMany({ where: { courseId } });
        await tx.enrollment.deleteMany({ where: { courseId } });
        await tx.payment.deleteMany({ where: { courseId } });
        await tx.earningsLedger.deleteMany({ where: { courseId } });
        await tx.course.delete({ where: { id: courseId } });

        // Clear OTP if it was used
        if (enrollmentCount > 0) {
            await tx.user.update({
                where: { id: userId },
                data: { deleteOtp: null, deleteOtpExpires: null }
            });
        }
    });

    return { message: "Course deleted successfully" };
};
