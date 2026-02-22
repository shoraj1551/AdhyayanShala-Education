import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import Logger from '../lib/logger';

// --- Team Members ---

export const getTeamMembers = async (req: Request, res: Response) => {
    try {
        const team = await prisma.teamMember.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(team);
    } catch (error) {
        Logger.error('Admin: Failed to fetch team', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
};

export const createTeamMember = async (req: Request, res: Response) => {
    try {
        const { name, role, bio, imageUrl, twitter, linkedin, website, email, phone, order, isActive } = req.body;

        if (!name || !role || !imageUrl) {
            return res.status(400).json({ error: 'Name, role, and image URL are required' });
        }

        const member = await prisma.teamMember.create({
            data: {
                name,
                role,
                bio,
                imageUrl,
                twitter,
                linkedin,
                website,
                email,
                phone,
                order: order || 0,
                isActive: isActive ?? true
            }
        });
        res.status(201).json(member);
    } catch (error) {
        Logger.error('Admin: Failed to create team member', error);
        res.status(500).json({ error: 'Failed to create team member' });
    }
};

export const updateTeamMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, role, bio, imageUrl, twitter, linkedin, website, email, phone, order, isActive } = req.body;

        if (!name || !role || !imageUrl) {
            return res.status(400).json({ error: 'Name, role, and image URL are required' });
        }

        const member = await prisma.teamMember.update({
            where: { id },
            data: {
                name,
                role,
                bio,
                imageUrl,
                twitter,
                linkedin,
                website,
                email,
                phone,
                order,
                isActive
            }
        });
        res.json(member);
    } catch (error) {
        Logger.error('Admin: Failed to update team member', error);
        res.status(500).json({ error: 'Failed to update team member' });
    }
};

export const deleteTeamMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.teamMember.delete({
            where: { id }
        });
        res.status(204).send();
    } catch (error) {
        Logger.error('Admin: Failed to delete team member', error);
        res.status(500).json({ error: 'Failed to delete team member' });
    }
};

// --- Social Handles ---

export const getSocials = async (req: Request, res: Response) => {
    try {
        const socials = await prisma.socialHandle.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(socials);
    } catch (error) {
        Logger.error('Admin: Failed to fetch socials', error);
        res.status(500).json({ error: 'Failed to fetch socials' });
    }
};

export const createSocial = async (req: Request, res: Response) => {
    try {
        const social = await prisma.socialHandle.create({
            data: req.body
        });
        res.status(201).json(social);
    } catch (error) {
        Logger.error('Admin: Failed to create social', error);
        res.status(500).json({ error: 'Failed to create social' });
    }
};

export const updateSocial = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const social = await prisma.socialHandle.update({
            where: { id },
            data: req.body
        });
        res.json(social);
    } catch (error) {
        Logger.error('Admin: Failed to update social', error);
        res.status(500).json({ error: 'Failed to update social' });
    }
};

export const deleteSocial = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.socialHandle.delete({
            where: { id }
        });
        res.status(204).send();
    } catch (error) {
        Logger.error('Admin: Failed to delete social', error);
        res.status(500).json({ error: 'Failed to delete social' });
    }
};

// --- Contact Info ---

export const getContacts = async (req: Request, res: Response) => {
    try {
        const contacts = await prisma.contactInfo.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(contacts);
    } catch (error) {
        Logger.error('Admin: Failed to fetch contacts', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
};

export const createContact = async (req: Request, res: Response) => {
    try {
        const contact = await prisma.contactInfo.create({
            data: req.body
        });
        res.status(201).json(contact);
    } catch (error) {
        Logger.error('Admin: Failed to create contact', error);
        res.status(500).json({ error: 'Failed to create contact' });
    }
};

export const updateContact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contact = await prisma.contactInfo.update({
            where: { id },
            data: req.body
        });
        res.json(contact);
    } catch (error) {
        Logger.error('Admin: Failed to update contact', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
};

export const deleteContact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.contactInfo.delete({
            where: { id }
        });
        res.status(204).send();
    } catch (error) {
        Logger.error('Admin: Failed to delete contact', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
};

// --- Contact Inquiries ---

export const getInquiries = async (req: Request, res: Response) => {
    try {
        const inquiries = await prisma.contactInquiry.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(inquiries);
    } catch (error) {
        Logger.error('Admin: Failed to fetch inquiries', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
};

export const updateInquiryStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const inquiry = await prisma.contactInquiry.update({
            where: { id },
            data: { status }
        });
        res.json(inquiry);
    } catch (error) {
        Logger.error('Admin: Failed to update inquiry status', error);
        res.status(500).json({ error: 'Failed to update inquiry status' });
    }
};

export const deleteInquiry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.contactInquiry.delete({
            where: { id }
        });
        res.status(204).send();
    } catch (error) {
        Logger.error('Admin: Failed to delete inquiry', error);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
};
