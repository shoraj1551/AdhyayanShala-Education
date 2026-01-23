
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Force-Create Sequence...");

    // 1. Force Create Instructor
    const password = await bcrypt.hash('instructor123', 10);

    // Delete if exists to ensure clean state
    try {
        await prisma.user.delete({ where: { email: 'instructor@shoraj.com' } });
        console.log("Deleted existing test user (if any).");
    } catch (e) { }

    const user = await prisma.user.create({
        data: {
            email: 'instructor@shoraj.com',
            name: 'Dr. Jane Stats',
            password: password,
            role: Role.INSTRUCTOR
        }
    });

    console.log(`SUCCESS: Created user ${user.email} (ID: ${user.id})`);
    console.log(`Password: instructor123 (Verified)`);
}

main()
    .catch(e => {
        console.error("FATAL ERROR:");
        console.error(e);
    })
    .finally(async () => await prisma.$disconnect());
