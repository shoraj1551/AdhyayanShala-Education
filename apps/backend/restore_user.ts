
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'shorajtomer@gmail.com';
    const hashedPassword = await bcrypt.hash('password123', 10); // Standard dev password

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Shoraj Tomer',
            password: hashedPassword,
            role: Role.INSTRUCTOR,
            bio: 'Lead Instructor',
            expertise: 'Full Stack Development',
        },
    });

    console.log('Instructor restored:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
