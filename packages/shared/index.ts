export interface Option {
    id: string;
    text: string;
    isCorrect?: boolean; // Optional as it might be hidden
    questionId: string;
}

export interface Question {
    id: string;
    text: string;
    type: 'MCQ' | 'NUMERICAL';
    explanation?: string;
    testId: string;
    options: Option[];
    points: number;
}

export interface Test {
    id: string;
    title: string;
    courseId: string;
    questions: Question[];
}
