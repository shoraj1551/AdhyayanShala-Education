import { z } from 'zod';
import { QuestionType } from '@prisma/client';

export const testSchema = z.object({
    title: z.string().min(3).max(100),
    courseId: z.string().uuid(),
    moduleId: z.string().uuid().optional(),
    duration: z.number().int().min(1).default(60),
    instructions: z.string().optional(),
    totalMarks: z.number().int().min(0).optional(),
    passMarks: z.number().int().min(0).optional(),
    isPublished: z.boolean().default(false),
    order: z.number().int().optional(),
    availableAt: z.string().optional().or(z.date()),
});

export const updateTestSchema = testSchema.partial();

export const optionSchema = z.object({
    text: z.string().min(1),
    isCorrect: z.boolean(),
    imageUrl: z.string().url().optional().or(z.string().length(0)),
});

export const questionSchema = z.object({
    text: z.string().min(1),
    type: z.nativeEnum(QuestionType).default(QuestionType.MCQ),
    explanation: z.string().optional(),
    points: z.number().min(0).default(1),
    negativeMarks: z.number().min(0).default(0),
    order: z.number().int().optional(),
    options: z.array(optionSchema).min(1),
});

export const updateQuestionSchema = questionSchema.partial();

export const submissionSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string().uuid(),
        optionId: z.string().uuid(),
        timeSpent: z.number().min(0).optional(),
    })),
});
