export const SHARED_CONSTANT = 'Shared Value';

export enum CourseLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

export enum QuestionType {
    MCQ = 'MCQ',
    NUMERICAL = 'NUMERICAL',
    TEXT = 'TEXT'
}

export interface Lesson {
    id: string;
    title: string;
    type: 'VIDEO' | 'TEXT';
    duration?: number | null;
    content?: string | null;
}

export interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

export interface Course {
    id: string;
    title: string;
    description?: string | null;
    level: CourseLevel;
    price: number;
    instructor?: {
        name: string | null;
    } | null;
    modules?: Module[];
}

export interface Option {
    id: string;
    text: string;
    isCorrect?: boolean; // Optional, might be hidden
}

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    points: number;
    options: Option[];
}

export interface Test {
    id: string;
    title: string;
    courseId: string;
    questions: Question[];
}

export interface Attempt {
    id: string;
    score: number;
    passed: boolean;
    completedAt: Date | string | null;
    reflections?: {
        questionId: string;
        isCorrect: boolean;
        explanation: string | null;
        correctOptionId?: string;
    }[];
}
