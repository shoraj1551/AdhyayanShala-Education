import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAdminOTP() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@adhyayan.com' },
        select: { loginOtp: true, loginOtpExpires: true }
    });

    if (user) {
        if (user.loginOtp) {
            console.log(`Admin OTP: ${user.loginOtp}`);
            console.log(`Expires: ${user.loginOtpExpires}`);
        } else {
            console.log('No OTP found for admin user.');
        }
    } else {
        console.log('Admin user not found.');
    }
    await prisma.$disconnect();
}

getAdminOTP();
