
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating Admin User...');

    const email = 'admin@shoraj.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN', // Ensure role is updated if exists
            password: hashedPassword
        },
        create: {
            email,
            password: hashedPassword,
            name: 'System Admin',
            role: 'ADMIN',
            bio: 'Platform Administrator',
        },
    });

    console.log('✅ Admin User Ready:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
