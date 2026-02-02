
import prisma from '../lib/prisma';
import { generateICS } from '../utils/icsGenerator';

export const getSettings = async (courseId: string) => {
    return await prisma.liveClassSettings.findUnique({
        where: { courseId }
    });
};

export const updateSettings = async (courseId: string, data: {
    platform?: string,
    meetingLink?: string,
    scheduleNote?: string,
    difficulty?: string
}) => {
    return await prisma.liveClassSettings.upsert({
        where: { courseId },
        update: data,
        create: {
            courseId,
            ...data
        }
    });
};

export const getSchedules = async (courseId: string) => {
    return await prisma.classSchedule.findMany({
        where: { courseId },
        orderBy: { dayOfWeek: 'asc' }
    });
};

export const addSchedule = async (courseId: string, data: {
    dayOfWeek: number,
    startTime: string,
    duration: number
}) => {
    return await prisma.classSchedule.create({
        data: {
            courseId,
            ...data
        }
    });
};

export const deleteSchedule = async (scheduleId: string) => {
    return await prisma.classSchedule.delete({
        where: { id: scheduleId }
    });
};

export const getCourseCalendar = async (courseId: string) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { schedules: true }
    });

    if (!course) throw new Error("Course not found");

    return generateICS(course.title, course.schedules);
};
