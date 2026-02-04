
import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Logger from '../lib/logger';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp + random + extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit (reduced from 50MB)
        files: 1 // Only allow 1 file per request
    },
    fileFilter: (req, file, cb) => {
        // Allowed MIME types
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'video/mp4',
            'video/webm'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
        }
    }
});

// Route
router.post('/', upload.single('file'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Construct URL
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        Logger.info('[Upload] File uploaded successfully', {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        res.json({ url: fileUrl, filename: req.file.filename });
    } catch (error: any) {
        Logger.error('[Upload] File upload failed', { error: error.message });

        // Handle multer errors specifically
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size exceeds 10MB limit' });
        }
        if (error.message?.includes('Invalid file type')) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'File upload failed' });
    }
});

export default router;
