'use client';

import { useState, useEffect } from 'react';
import { submitTest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TestRunner({ test }: { test: any }) {
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const { token } = useAuth();
    const [error, setError] = useState("");

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState(test.duration ? test.duration * 60 : 0); // in seconds

    useEffect(() => {
        if (result || timeLeft <= 0 || !test.duration) return;

        const timer = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, result, test.duration]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSelect = (questionId: string, optionId: string) => {
        if (result) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        if (!token) return;
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qid, oid]) => ({
                questionId: qid,
                optionId: oid
            }));

            const res = await submitTest(test.id, formattedAnswers, token);
            setResult(res);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            setError('Error submitting test: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className={cn("border-2", result.attempt.passed ? "border-green-500 bg-green-50/50" : "border-red-500 bg-red-50/50")}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            {result.attempt.passed ? <CheckCircle className="text-green-600" /> : <XCircle className="text-red-600" />}
                            {result.attempt.passed ? 'Assessment Passed!' : 'Assessment Failed'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                            You scored <span className="font-bold">{result.attempt.score}</span> out of {result.totalPoints} points.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href={`/courses/${test.courseId}`}>
                            <Button>Back to Course</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <div className="space-y-6">
                    {test.questions.map((q: any, idx: number) => {
                        const reflection = result.reflections.find((r: any) => r.questionId === q.id);
                        const isCorrect = reflection?.isCorrect;
                        const userAnswerId = answers[q.id];

                        return (
                            <Card key={q.id} className={cn("border", isCorrect ? "border-green-200" : "border-red-200")}>
                                <CardHeader>
                                    <h3 className="font-medium text-lg">
                                        {idx + 1}. {q.text}
                                    </h3>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {q.options.map((opt: any) => {
                                        const isSelected = userAnswerId === opt.id;
                                        const isActuallyCorrect = reflection?.correctOptionId === opt.id;

                                        return (
                                            <div
                                                key={opt.id}
                                                className={cn(
                                                    "p-3 rounded border flex justify-between items-center",
                                                    isActuallyCorrect ? "bg-green-100 border-green-300 text-green-900" :
                                                        (isSelected && !isActuallyCorrect) ? "bg-red-100 border-red-300 text-red-900" : "opacity-70"
                                                )}
                                            >
                                                <span>{opt.text}</span>
                                                {isActuallyCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                                                {isSelected && !isActuallyCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                                            </div>
                                        )
                                    })}

                                    {reflection?.explanation && (
                                        <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground">
                                            <strong>Explanation:</strong> {reflection.explanation}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto py-8">
            <div className="flex justify-between items-start sticky top-4 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">{test.title}</h1>
                    <p className="text-muted-foreground text-sm">Answer all questions.</p>
                </div>
                {test.duration > 0 && (
                    <div className={cn("flex items-center gap-2 font-mono text-xl font-bold", timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary")}>
                        <Clock className="h-5 w-5" />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 rounded-md bg-destructive/15 text-destructive">
                    {error}
                </div>
            )}

            {test.questions.map((q: any, idx: number) => (
                <Card key={q.id}>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">
                            {idx + 1}. {q.text}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {q.options.map((opt: any) => (
                            <div key={opt.id} className="flex items-center space-x-2">
                                <div
                                    className={cn(
                                        "flex items-center w-full p-4 rounded-md border cursor-pointer hover:bg-accent transition-colors",
                                        answers[q.id] === opt.id ? "border-primary bg-accent" : "border-input"
                                    )}
                                    onClick={() => handleSelect(q.id, opt.id)}
                                >
                                    <div className={cn(
                                        "h-4 w-4 rounded-full border border-primary mr-3 flex items-center justify-center",
                                        answers[q.id] === opt.id ? "bg-primary" : "bg-transparent"
                                    )}>
                                        {answers[q.id] === opt.id && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                                    </div>
                                    <Label className="cursor-pointer">{opt.text}</Label>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full md:w-auto"
                size="lg"
            >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
        </div>
    );
}
