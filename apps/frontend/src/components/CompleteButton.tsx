'use client';

import { markLessonComplete } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CompleteButton({ lessonId, nextLessonUrl }: { lessonId: string, nextLessonUrl?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        setLoading(true);
        try {
            await markLessonComplete(lessonId);
            if (nextLessonUrl) {
                router.push(nextLessonUrl);
            } else {
                // End of course
                router.push('/courses');
            }
        } catch (error) {
            alert('Error marking complete');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleComplete}
            disabled={loading}
            className="bg-foreground text-background px-6 py-2 rounded-sm text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
            {loading ? 'Saving...' : (nextLessonUrl ? 'Complete & Continue →' : 'Complete Course')}
        </button>
    );
}
