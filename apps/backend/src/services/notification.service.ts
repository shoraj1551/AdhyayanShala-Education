
import prisma from '../lib/prisma';

export const sendClassReminder = async (courseId: string, minutesBefore: number) => {
    console.log(`[NotificationJob] Checking reminders for Course ${courseId} - ${minutesBefore}m before class`);

    const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: { user: true }
    });

    let count = 0;
    for (const enrollment of enrollments) {
        let shouldNotify = false;
        if (minutesBefore === 15 && enrollment.notify15m) shouldNotify = true;
        if (minutesBefore === 30 && enrollment.notify30m) shouldNotify = true;
        if (minutesBefore === 60 && enrollment.notify1h) shouldNotify = true;

        if (shouldNotify) {
            const message = `Reminder: Live Class for ${courseId} starts in ${minutesBefore} minutes!`;

            // Mock SMS
            if (enrollment.notifySMS && enrollment.user.phoneNumber) {
                console.log(`[SMS] Sending to ${enrollment.user.phoneNumber}: ${message}`);
            }

            // Mock Email
            if (enrollment.notifyEmail) {
                console.log(`[Email] Sending to ${enrollment.user.email}: ${message}`);
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
