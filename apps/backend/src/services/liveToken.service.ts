
import jwt from 'jsonwebtoken';

const JITSI_APP_ID = process.env.JITSI_APP_ID || 'shoraj-learning';
const JITSI_APP_SECRET = process.env.JITSI_APP_SECRET || 'shoraj-learning-secret-change-in-production';
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || 'meet.jit.si';

export interface JitsiTokenPayload {
    roomName: string;
    token: string;
    domain: string;
}

export const generateJitsiToken = (
    courseId: string,
    user: { name: string; email: string; role: string }
): JitsiTokenPayload => {
    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const sanitizedRoom = slugify(courseId) || 'general';
    const roomName = `shoraj-${sanitizedRoom}`;

    if (!process.env.JITSI_APP_ID || !process.env.JITSI_APP_SECRET) {
        return {
            roomName,
            token: '',
            domain: JITSI_DOMAIN,
        };
    }

    const isModerator = user.role === 'INSTRUCTOR' || user.role === 'ADMIN' || user.role === 'MODERATOR';

    const payload = {
        context: {
            user: {
                name: user.name || 'Student',
                email: user.email,
                avatar: '',
                id: user.email,
                role: isModerator ? 'moderator' : 'participant',
                moderator: isModerator,
            },
            features: {
                livestreaming: isModerator,
                recording: isModerator,
                transcription: isModerator,
                'outbound-call': isModerator,
            },
        },
        aud: 'jitsi',
        iss: JITSI_APP_ID,
        sub: JITSI_APP_ID,
        room: '*', // Match any room to avoid mismatch issues
        moderator: isModerator,
        exp: Math.floor(Date.now() / 1000) + 60 * 120, // 2hr token
    };

    const token = jwt.sign(payload, JITSI_APP_SECRET, { algorithm: 'HS256' });

    return {
        roomName,
        token,
        domain: JITSI_DOMAIN,
    };
};
