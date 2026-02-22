import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'admin@adhyayan.com';
    const password = 'Admin@Ashala123'; // Strong password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                name: 'System Admin'
            },
            create: {
                email,
                password: hashedPassword,
                role: 'ADMIN',
                name: 'System Admin'
            }
        });
        console.log(`Admin user ${user.email} created/updated successfully.`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
