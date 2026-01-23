
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("Creating Admin Account...");
    const password = await bcrypt.hash('admin123', 10);

    // Delete if exists
    try { await prisma.user.delete({ where: { email: 'admin@shoraj.com' } }); } catch { }

    await prisma.user.create({
        data: {
            email: 'admin@shoraj.com',
            name: 'Super Admin',
            password: password,
            role: Role.ADMIN
        }
    });

    console.log("Admin Created: admin@shoraj.com / admin123");
}

main().finally(async () => await prisma.$disconnect());
