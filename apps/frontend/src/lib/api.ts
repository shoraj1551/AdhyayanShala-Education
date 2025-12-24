import { Course } from '@shoraj/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getCourses(): Promise<Course[]> {
    const res = await fetch(`${API_URL}/courses`, {
        cache: 'no-store' // Dynamic data
    });
    if (!res.ok) {
        throw new Error('Failed to fetch courses');
    }
    return res.json();
}

export async function getCourse(id: string): Promise<Course> {
    const res = await fetch(`${API_URL}/courses/${id}`, {
        cache: 'no-store'
    });
    if (!res.ok) {
        if (res.status === 404) return null as any;
        throw new Error('Failed to fetch course');
    }
    return res.json();
}

export async function markLessonComplete(lessonId: string): Promise<void> {
    const res = await fetch(`${API_URL}/progress/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
    });

    if (!res.ok) {
        throw new Error('Failed to mark lesson complete');
    }
}

export async function getTest(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/tests/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch test');
    return res.json();
}

export async function submitTest(id: string, answers: { questionId: string; optionId: string }[]): Promise<any> {
    const res = await fetch(`${API_URL}/tests/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error('Failed to submit test');
    return res.json();
}
