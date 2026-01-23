
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("Creating Student Account...");
    const password = await bcrypt.hash('student123', 10);

    // Delete if exists
    try { await prisma.user.delete({ where: { email: 'student@shoraj.com' } }); } catch { }

    await prisma.user.create({
        data: {
            email: 'student@shoraj.com',
            name: 'Demo Student',
            password: password,
            role: Role.STUDENT
        }
    });
    console.log("Student Created: student@shoraj.com / student123");
}

main().finally(async () => await prisma.$disconnect());
