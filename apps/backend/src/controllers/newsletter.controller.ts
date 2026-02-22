import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendEmail } from '../services/email.service';
import Logger from '../lib/logger';

export const subscribe = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if already subscribed
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existing) {
            if (!existing.isActive) {
                // Reactivate
                await prisma.newsletterSubscriber.update({
                    where: { id: existing.id },
                    data: { isActive: true }
                });
                return res.status(200).json({ message: 'Welcome back! You have been resubscribed.' });
            }
            return res.status(200).json({ message: 'You are already subscribed!' });
        }

        // Create new subscriber
        await prisma.newsletterSubscriber.create({
            data: { email }
        });

        // Send confirmation email
        await sendEmail({
            to: email,
            subject: 'Welcome to AdhyayanShala Waitlist!',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>You're on the list!</h2>
                    <p>Thanks for joining the AdhyayanShala waitlist.</p>
                    <p>We'll keep you updated on new courses, features, and community events.</p>
                    <br/>
                    <p>Best,<br/>The AdhyayanShala Team</p>
                </div>
            `
        });

        res.status(201).json({ message: 'Successfully subscribed to the waitlist!' });

    } catch (error) {
        Logger.error('Newsletter subscription error:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};
