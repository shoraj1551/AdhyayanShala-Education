
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Option {
    id: string;
    text: string;
    imageUrl?: string;
}

interface Question {
    id: string;
    text: string;
    type: string;
    options: Option[];
    points: number;
}

interface Test {
    id: string;
    title: string;
    duration: number;
    questions: Question[];
}

interface TestPlayerProps {
    testId: string;
    onComplete?: (score: number, passed: boolean) => void;
}

export function TestPlayer({ testId, onComplete }: TestPlayerProps) {
    const { token } = useAuth();
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; passed: boolean; totalPoints: number } | null>(null);

    useEffect(() => {
        if (!testId || !token) return;
        setLoading(true);
        // Reset state when testId changes
        setAnswers({});
        setResult(null);

        api.get(`/tests/${testId}`, token)
            .then(data => {
                setTest(data);
            })
            .catch(err => {
                console.error("Failed to load test", err);
                toast.error("Failed to load test");
            })
            .finally(() => setLoading(false));
    }, [testId, token]);

    const handleOptionSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        if (!test || !token) return;

        // Validation: Ensure all questions are answered
        const unanswered = test.questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            toast.error(`Please answer all ${test.questions.length} questions.`);
            return;
        }

        setSubmitting(true);
        try {
            // Prepare submission payload
            // Backend expects: { answers: [{ questionId, optionId }] }
            const submission = {
                answers: Object.entries(answers).map(([questionId, optionId]) => ({
                    questionId,
                    optionId
                }))
            };

            const data = await api.post(`/tests/${testId}/submit`, submission, token);
            setResult({
                score: data.score,
                passed: data.passed,
                totalPoints: data.totalPoints || test.questions.reduce((acc, q) => acc + q.points, 0)
            });
            if (onComplete) onComplete(data.score, data.passed);
            toast.success("Test submitted successfully!");
        } catch (error) {
            console.error("Submission failed", error);
            toast.error("Failed to submit test.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!test) {
        return <div className="text-center p-8">Test not found.</div>;
    }

    if (result) {
        return (
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <Card className="text-center py-10">
                    <CardHeader>
                        <div className="mx-auto mb-4 bg-primary/10 p-4 rounded-full w-fit">
                            <Trophy className={`h-12 w-12 ${result.passed ? 'text-yellow-500' : 'text-gray-400'}`} />
                        </div>
                        <CardTitle className="text-3xl font-bold">{result.passed ? 'Congratulations!' : 'Keep Practicing'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-muted-foreground text-lg">You scored</p>
                        <div className="text-5xl font-extrabold text-primary">
                            {result.score} <span className="text-2xl text-muted-foreground">/ {result.totalPoints}</span>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {result.passed ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            {result.passed ? 'Passed' : 'Failed'}
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center pt-6">
                        <Button onClick={() => setResult(null)} variant="outline">Retake Quiz</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">{test.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{test.questions.length} Questions</span>
                    <span>•</span>
                    <span>{test.duration} Minutes</span>
                </div>
            </div>

            <div className="space-y-6">
                {test.questions.map((q, index) => (
                    <Card key={q.id}>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">
                                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                                {q.text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={answers[q.id]}
                                onValueChange={(val) => handleOptionSelect(q.id, val)}
                                className="space-y-3"
                            >
                                {q.options.map((opt) => (
                                    <div key={opt.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                        <RadioGroupItem value={opt.id} id={opt.id} />
                                        <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-normal">
                                            {opt.text}
                                            {opt.imageUrl && <img src={opt.imageUrl} alt="Option" className="mt-2 h-20 rounded-md object-cover" />}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="sticky bottom-4 bg-background/95 backdrop-blur p-4 border rounded-lg shadow-lg flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    Answered: {Object.keys(answers).length} / {test.questions.length}
                </p>
                <Button size="lg" onClick={handleSubmit} disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Quiz
                </Button>
            </div>
        </div>
    );
}
