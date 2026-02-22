
import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import Logger from '../lib/logger';

import newsletterRoutes from './newsletter.routes';

const router = express.Router();

router.use('/newsletter', newsletterRoutes);

// Get Team Members
router.get('/team', async (req: Request, res: Response) => {
    try {
        const team = await prisma.teamMember.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        res.json(team);
    } catch (error) {
        Logger.error('Failed to fetch team members', error);
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
});

// Get Social Handles
router.get('/socials', async (req: Request, res: Response) => {
    try {
        const socials = await prisma.socialHandle.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        res.json(socials);
    } catch (error) {
        Logger.error('Failed to fetch social handles', error);
        res.status(500).json({ error: 'Failed to fetch social handles' });
    }
});

// Get Contact Info
router.get('/contact', async (req: Request, res: Response) => {
    try {
        const contactInfo = await prisma.contactInfo.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });

        // Group by category for easier frontend consumption
        const grouped = {
            EMAIL: contactInfo.filter(c => c.category === 'EMAIL'),
            PHONE: contactInfo.filter(c => c.category === 'PHONE'),
            OFFICE: contactInfo.filter(c => c.category === 'OFFICE'),
        };

        res.json(grouped);
    } catch (error) {
        Logger.error('Failed to fetch contact info', error);
        res.status(500).json({ error: 'Failed to fetch contact info' });
    }
});

// Submit Contact Inquiry
router.post('/contact/inquiry', async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            res.status(400).json({ error: 'Name, email and message are required' });
            return;
        }

        const inquiry = await prisma.contactInquiry.create({
            data: {
                name,
                email,
                subject,
                message
            }
        });

        res.status(201).json(inquiry);
    } catch (error) {
        Logger.error('Failed to submit inquiry', error);
        res.status(500).json({ error: 'Failed to submit inquiry' });
    }
});

export default router;
