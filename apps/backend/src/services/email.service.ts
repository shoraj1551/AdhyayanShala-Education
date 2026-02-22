import Logger from '../lib/logger';
import { config } from '../config/env.config';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    // TODO: Integrate with a real email provider (e.g., Resend, SendGrid, AWS SES)

    if (config.NODE_ENV === 'development') {
        Logger.info(`[EMAIL MOCK] 
        To: ${options.to}
        Subject: ${options.subject}
        Content: ${options.html.substring(0, 50)}...
        `);
    } else {
        // In production, we should ideally throw or log an error if no provider is configured
        // For now, we log to stdout to ensure visibility
        Logger.info(`[EMAIL SERVICE] Sending email to ${options.to} with subject "${options.subject}"`);
    }
};

export const sendAdminOTP = async (email: string, otp: string) => {
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Admin Login Verification</h2>
            <p>Your OTP for login is:</p>
            <h1 style="letter-spacing: 5px; background: #f4f4f5; padding: 10px; display: inline-block;">${otp}</h1>
            <p>This code expires in 5 minutes.</p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Your Admin Login OTP',
        html
    });
};
