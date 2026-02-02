import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Shoraj's instructor account
    const hashedPassword = await bcrypt.hash('password123', 10);

    const instructor = await prisma.user.upsert({
        where: { email: 'shorajtomer@gmail.com' },
        update: {},
        create: {
            email: 'shorajtomer@gmail.com',
            password: hashedPassword,
            name: 'Shoraj Tomer',
            role: 'INSTRUCTOR',
            bio: 'Experienced instructor specializing in web development and system design',
        },
    });

    console.log('✅ Created instructor:', instructor.email);

    // Create a student account for testing
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'student@test.com' },
        update: {},
        create: {
            email: 'student@test.com',
            password: studentPassword,
            name: 'Test Student',
            role: 'STUDENT',
        },
    });

    console.log('✅ Created student:', student.email);

    // ========== PRE-RECORDED COURSE ==========
    const videoCourse = await prisma.course.create({
        data: {
            title: 'Complete Web Development Bootcamp',
            description: 'Master modern web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and deploy real-world projects.',
            level: 'BEGINNER',
            price: 2999,
            type: 'VIDEO',
            isPublished: true,
            publishedAt: new Date(),
            instructorId: instructor.id,
        },
    });

    console.log('✅ Created pre-recorded course:', videoCourse.title);

    // Create modules for video course
    const module1 = await prisma.module.create({
        data: {
            title: 'Introduction to Web Development',
            order: 1,
            courseId: videoCourse.id,
        },
    });

    await prisma.lesson.createMany({
        data: [
            {
                title: 'Welcome to the Course',
                type: 'VIDEO',
                content: 'Introduction to the course structure and what you will learn',
                videoUrl: 'https://example.com/videos/intro.mp4',
                summary: 'Course overview and learning path',
                order: 1,
                moduleId: module1.id,
            },
            {
                title: 'Setting Up Your Development Environment',
                type: 'VIDEO',
                content: 'Install VS Code, Node.js, and essential tools',
                videoUrl: 'https://example.com/videos/setup.mp4',
                summary: 'Development environment setup guide',
                order: 2,
                moduleId: module1.id,
            },
        ],
    });

    const module2 = await prisma.module.create({
        data: {
            title: 'HTML & CSS Fundamentals',
            order: 2,
            courseId: videoCourse.id,
        },
    });

    await prisma.lesson.createMany({
        data: [
            {
                title: 'HTML Basics',
                type: 'TEXT',
                content: '# HTML Basics\n\nHTML (HyperText Markup Language) is the standard markup language for creating web pages.\n\n## Key Concepts:\n- Elements and Tags\n- Attributes\n- Semantic HTML',
                summary: 'Introduction to HTML structure and syntax',
                order: 1,
                moduleId: module2.id,
            },
            {
                title: 'CSS Styling',
                type: 'VIDEO',
                content: 'Learn CSS selectors, properties, and layout techniques',
                videoUrl: 'https://example.com/videos/css.mp4',
                summary: 'CSS fundamentals and styling techniques',
                order: 2,
                moduleId: module2.id,
            },
        ],
    });

    await prisma.test.create({
        data: {
            title: 'HTML & CSS Quiz',
            duration: 30,
            order: 1,
            moduleId: module2.id,
            courseId: videoCourse.id,
        },
    });

    console.log('✅ Created modules and lessons for video course');

    // ========== LIVE CLASSES COURSE ==========
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Start in 7 days
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 60); // 60-day course

    const liveCourse = await prisma.course.create({
        data: {
            title: 'System Design Masterclass - Live',
            description: 'Interactive live sessions on system design, scalability, and architecture patterns. Learn from real-world case studies and get your questions answered in real-time.',
            level: 'ADVANCED',
            price: 15000,
            pricePerClass: 500,
            discountedPrice: 12000,
            totalClasses: 30,
            startDate: startDate,
            endDate: endDate,
            type: 'LIVE',
            meetingPlatform: 'ZOOM',
            meetingLink: 'https://zoom.us/j/example123',
            schedule: 'Mon, Wed, Fri at 8:00 PM IST',
            isPublished: true,
            publishedAt: new Date(),
            instructorId: instructor.id,
        },
    });

    console.log('✅ Created live course:', liveCourse.title);

    // Create modules for live course
    const liveModule1 = await prisma.module.create({
        data: {
            title: 'Fundamentals of System Design',
            order: 1,
            courseId: liveCourse.id,
        },
    });

    await prisma.lesson.create({
        data: {
            title: 'Introduction to System Design',
            type: 'TEXT',
            content: '# System Design Fundamentals\n\nLearn the core principles of designing scalable systems.\n\n## Topics:\n- Scalability\n- Reliability\n- Availability\n- Performance',
            summary: 'Core system design principles',
            order: 1,
            moduleId: liveModule1.id,
        },
    });

    // Create Live Class Settings
    const liveSettings = await prisma.liveClassSettings.create({
        data: {
            courseId: liveCourse.id,
            platform: 'ZOOM',
            meetingLink: 'https://zoom.us/j/example123',
            scheduleNote: 'Mon, Wed, Fri at 8:00 PM IST',
        },
    });

    console.log('✅ Created live class settings');

    // Create class schedules
    await prisma.classSchedule.createMany({
        data: [
            {
                courseId: liveCourse.id,
                dayOfWeek: 1, // Monday
                startTime: '20:00',
                duration: 90,
            },
            {
                courseId: liveCourse.id,
                dayOfWeek: 3, // Wednesday
                startTime: '20:00',
                duration: 90,
            },
            {
                courseId: liveCourse.id,
                dayOfWeek: 5, // Friday
                startTime: '20:00',
                duration: 90,
            },
        ],
    });

    console.log('✅ Created class schedules');

    // Enroll student in video course
    await prisma.enrollment.create({
        data: {
            userId: student.id,
            courseId: videoCourse.id,
        },
    });

    console.log('✅ Enrolled student in video course');

    console.log('\n🎉 Seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   - 1 Instructor: ${instructor.email}`);
    console.log(`   - 1 Student: ${student.email}`);
    console.log(`   - 1 Pre-recorded Course: "${videoCourse.title}" (3 modules, 5 lessons, 1 test)`);
    console.log(`   - 1 Live Course: "${liveCourse.title}" (₹${liveCourse.discountedPrice} discounted from ₹${liveCourse.price})`);
    console.log(`   - Live class schedules: Mon, Wed, Fri at 8:00 PM (90 min each)`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
