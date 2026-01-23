
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for instructor@shoraj.com...");
    const user = await prisma.user.findUnique({
        where: { email: 'instructor@shoraj.com' },
    });

    if (!user) {
        console.error("ERROR: User NOT FOUND in database!");
        return;
    }

    console.log(`User Found: ${user.email} (ID: ${user.id})`);
    console.log(`Role: ${user.role}`);
    console.log(`Stored Hash: ${user.password}`);

    const match = await bcrypt.compare('instructor123', user.password);
    console.log(`Password 'instructor123' match: ${match}`);

    if (!match) {
        console.log("Resetting password to 'instructor123'...");
        const newHash = await bcrypt.hash('instructor123', 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: newHash }
        });
        console.log("Password RESET successful.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
