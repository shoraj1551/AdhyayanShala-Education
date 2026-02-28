
import prisma from '../lib/prisma';
import Logger from '../lib/logger';

export const sendClassReminder = async (courseId: string, minutesBefore: number) => {
    Logger.info(`[NotificationJob] Checking reminders for Course ${courseId} - ${minutesBefore}m before class`);

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
            instructorId: true,
            title: true,
            instructor: { select: { email: true, name: true } }
        }
    });

    let count = 0;

    // Notify Instructor (Always)
    if (course?.instructorId && course.instructor) {
        const message = `Reminder: Your live class for "${course.title}" starts in ${minutesBefore} minutes!`;

        // In-App Notification
        await prisma.notification.create({
            data: {
                userId: course.instructorId,
                title: "Live Class Reminder",
                message
            }
        });

        // Email Mock for Instructor
        if (course.instructor.email) {
            Logger.info(`[Email] Sending to Instructor ${course.instructor.email}: ${message}`);
        }

        count++;
    }

    const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: { user: true }
    });

    for (const enrollment of enrollments) {
        let shouldNotify = false;
        if (minutesBefore === 15 && enrollment.notify15m) shouldNotify = true;
        if (minutesBefore === 30 && enrollment.notify30m) shouldNotify = true;
        if (minutesBefore === 60 && enrollment.notify1h) shouldNotify = true;

        if (shouldNotify) {
            const message = `Reminder: Live Class for "${course?.title || courseId}" starts in ${minutesBefore} minutes!`;

            // Mock SMS
            if (enrollment.notifySMS && enrollment.user.phoneNumber) {
                const maskedPhone = enrollment.user.phoneNumber.replace(/.(?=.{4})/g, '*');
                Logger.info(`[SMS] Sending to ${maskedPhone}: ${message}`);
            }

            // Mock Email
            if (enrollment.notifyEmail) {
                const [local, domain] = enrollment.user.email.split('@');
                const maskedEmail = `${local.substring(0, 2)}***@${domain}`;
                Logger.info(`[Email] Sending to ${maskedEmail}: ${message}`);
            }

            // In-App Notification
            await prisma.notification.create({
                data: {
                    userId: enrollment.userId,
                    title: "Live Class Reminder",
                    message
                }
            });
            count++;
        }
    }
    return { sent: count };
};

export const sendAllClassReminders = async (minutesBefore: number) => {
    Logger.info(`[NotificationJob] Checking all live class reminders - ${minutesBefore}m before start`);

    // 1. Calculate target time
    const now = new Date();
    const targetTime = new Date(now.getTime() + minutesBefore * 60 * 1000);

    // dayOfWeek: 1 (Mon) to 7 (Sun)
    let dayOfWeek = targetTime.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7; // Map Sun 0 -> 7

    const h = targetTime.getHours();
    const m = targetTime.getMinutes();

    // Find schedules matching this day
    const schedules = await prisma.classSchedule.findMany({
        where: { dayOfWeek }
    });

    let totalSent = 0;
    for (const schedule of schedules) {
        // Compare time strings
        const [schHours, schMins] = schedule.startTime.split(':').map(Number);
        const schTotalMins = schHours * 60 + schMins;
        const targetTotalMins = h * 60 + m;

        // If it's within 3 minutes window
        if (Math.abs(schTotalMins - targetTotalMins) <= 2) {
            const res = await sendClassReminder(schedule.courseId, minutesBefore);
            totalSent += res.sent;
        }
    }

    return { sent: totalSent };
};

export const sendMentorshipReminders = async (minutesBefore: number) => {
    Logger.info(`[NotificationJob] Checking mentorship reminders - ${minutesBefore}m before session`);

    const now = new Date();
    const targetTime = new Date(now.getTime() + minutesBefore * 60 * 1000);
    const windowStart = new Date(targetTime.getTime() - 2 * 60 * 1000);
    const windowEnd = new Date(targetTime.getTime() + 2 * 60 * 1000);

    const bookings = await prisma.mentorshipBooking.findMany({
        where: {
            status: 'CONFIRMED',
            date: {
                gte: new Date(now.setHours(0, 0, 0, 0)),
                lte: new Date(now.setHours(23, 59, 59, 999))
            }
        },
        include: {
            student: true,
            instructor: true
        }
    });

    let count = 0;
    for (const booking of bookings) {
        const [hours, minutes] = booking.startTime.split(':').map(Number);
        const bookingDateTime = new Date(booking.date);
        bookingDateTime.setHours(hours, minutes, 0, 0);

        if (bookingDateTime >= windowStart && bookingDateTime <= windowEnd) {
            const message = `Reminder: Your mentorship session with ${booking.instructor.name} starts in ${minutesBefore} minutes!`;
            const instructorMessage = `Reminder: Your mentorship session with ${booking.student.name} starts in ${minutesBefore} minutes!`;

            await prisma.notification.create({
                data: {
                    userId: booking.studentId,
                    title: "Mentorship Reminder",
                    message
                }
            });

            await prisma.notification.create({
                data: {
                    userId: booking.instructorId,
                    title: "Mentorship Reminder",
                    message: instructorMessage
                }
            });

            Logger.info(`[Mentorship] Reminders sent for Booking ${booking.id}`);
            count += 2;
        }
    }
    return { sent: count };
};

export const sendTestAvailableNotifications = async () => {
    Logger.info(`[NotificationJob] Checking for newly available tests`);

    const now = new Date();
    // Look for tests that became available in the last 6 minutes (job runs every 5)
    const windowStart = new Date(now.getTime() - 6 * 60 * 1000);

    const tests = await prisma.test.findMany({
        where: {
            availableAt: {
                gte: windowStart,
                lte: now
            },
            isPublished: true
        },
        include: {
            course: {
                select: {
                    title: true,
                    enrollments: {
                        include: { user: true }
                    }
                }
            }
        }
    });

    let count = 0;
    for (const test of tests) {
        const message = `New Test Available: "${test.title}" is now active in ${test.course.title}!`;

        for (const enrollment of test.course.enrollments) {
            // In-App Notification
            await prisma.notification.create({
                data: {
                    userId: enrollment.userId,
                    title: "Test Released",
                    message,
                    link: `/courses/${test.courseId}` // Link to course where test is
                }
            });

            // Mock Email
            if (enrollment.user.email) {
                Logger.info(`[Email] Sending to Student ${enrollment.user.email}: ${message}`);
            }
            count++;
        }
    }

    return { sent: count };
};
