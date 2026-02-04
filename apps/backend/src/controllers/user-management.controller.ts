import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as UserManagementService from '../services/user-management.service';

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        const role = req.query.role as string;

        const result = await UserManagementService.getAllUsers(page, limit, search, role);
        res.json(result);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const getUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = await UserManagementService.getUserDetails(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("Get User Details Error:", error);
        res.status(500).json({ message: "Failed to fetch user details" });
    }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Prevent changing own role or super admin considerations (simplified here)
        if (id === req.user?.id) {
            return res.status(403).json({ message: "Cannot change your own role" });
        }

        const updatedUser = await UserManagementService.updateUserRole(id, role);
        res.json(updatedUser);
    } catch (error) {
        console.error("Update Role Error:", error);
        res.status(500).json({ message: "Failed to update role" });
    }
};
