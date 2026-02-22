
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding public data...');

    // --- Team Members ---
    await prisma.teamMember.deleteMany({});
    await prisma.teamMember.create({
        data: {
            name: 'Shoraj Tomer',
            role: 'Founder & Lead Instructor',
            bio: 'With years of experience in education and technology, Shoraj is passionate about creating learning experiences that are both rigorous and accessible. His teaching philosophy centers on practical application, continuous improvement, and fostering a growth mindset.',
            imageUrl: 'https://github.com/shadcn.png', // Placeholder from current site
            twitter: 'https://twitter.com/shoraj', // Placeholder
            linkedin: 'https://linkedin.com/in/shoraj',
            order: 1,
            isActive: true,
        },
    });

    // --- Social Handles ---
    await prisma.socialHandle.deleteMany({});
    const socials = [
        { platform: 'Twitter', url: 'https://twitter.com', icon: 'Twitter', order: 1 },
        { platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'Linkedin', order: 2 },
        { platform: 'Instagram', url: 'https://instagram.com', icon: 'Instagram', order: 3 },
        { platform: 'YouTube', url: 'https://youtube.com', icon: 'Youtube', order: 4 },
    ];

    for (const s of socials) {
        await prisma.socialHandle.create({ data: s });
    }

    // --- Contact Info ---
    await prisma.contactInfo.deleteMany({});

    // Email
    await prisma.contactInfo.create({
        data: {
            category: 'EMAIL',
            label: 'General Inquiries',
            value: 'info@adhyayanshala.com',
            isPrimary: true,
            order: 1,
        }
    });
    await prisma.contactInfo.create({
        data: {
            category: 'EMAIL',
            label: 'Student Support',
            value: 'support@adhyayanshala.com',
            isPrimary: false,
            order: 2,
        }
    });

    // Phone
    await prisma.contactInfo.create({
        data: {
            category: 'PHONE',
            label: 'Phone Support',
            value: '+91 98765 43210',
            description: 'Available Mon-Fri, 9am - 6pm IST',
            isPrimary: true,
            order: 1,
        }
    });

    // Office
    await prisma.contactInfo.create({
        data: {
            category: 'OFFICE',
            label: 'Our Office',
            value: 'Sector 62, Noida, Uttar Pradesh, India - 201301',
            description: 'AdhyayanShala Education Pvt Ltd.',
            isPrimary: true,
            order: 1,
        }
    });


    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
