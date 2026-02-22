
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
    const isModerator = user.role === 'INSTRUCTOR' || user.role === 'ADMIN';

    const payload = {
        context: {
            user: {
                name: user.name || 'Student',
                email: user.email,
                avatar: '',
                moderator: isModerator,
            },
            features: {
                livestreaming: isModerator,
                recording: isModerator,
                transcription: false,
                'outbound-call': false,
            },
        },
        aud: 'jitsi',
        iss: JITSI_APP_ID,
        sub: JITSI_DOMAIN,
        room: `shoraj-${courseId}`,   // Namespaced room name per course
        moderator: isModerator,
        exp: Math.floor(Date.now() / 1000) + 60 * 120, // 2hr token
    };

    const token = jwt.sign(payload, JITSI_APP_SECRET, { algorithm: 'HS256' });

    return {
        roomName: `shoraj-${courseId}`,
        token,
        domain: JITSI_DOMAIN,
    };
};
