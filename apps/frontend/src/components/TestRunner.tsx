'use client';

import { useState, useEffect } from 'react';
import { submitTest, api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { MathRenderer } from "@/components/MathRenderer";
import { LeaderboardView } from "@/components/LeaderboardView";

export default function TestRunner({ test }: { test: any }) {
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const { token } = useAuth();
    const [error, setError] = useState("");
    const [hasStarted, setHasStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState(test.duration ? test.duration * 60 : 0); // in seconds

    useEffect(() => {
        if (!hasStarted || result || timeLeft <= 0 || !test.duration) return;

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
    }, [hasStarted, timeLeft, result, test.duration]);

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
                        <CardTitle className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-2xl">
                                {result.attempt.passed ? <CheckCircle className="text-green-600" /> : <XCircle className="text-red-600" />}
                                {result.attempt.passed ? 'Assessment Passed!' : 'Assessment Failed'}
                            </div>
                            {result.rank && (
                                <div className="text-xl font-bold px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                                    Current Rank: #{result.rank}
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <p className="text-lg">
                            You scored <span className="font-bold">{result.attempt.score}</span> out of {result.totalPoints} points.
                        </p>
                        <div className="text-right">
                            <p className="text-sm text-zinc-500">Correct: {result.reflections.filter((r: any) => r.isCorrect).length}</p>
                            <p className="text-sm text-zinc-500">Wrong: {result.reflections.filter((r: any) => !r.isCorrect).length}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Link href={`/courses/${test.courseId}`}>
                            <Button>Back to Course</Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* Leaderboard Section */}
                <LeaderboardView testId={test.id} token={token} currentScore={result.attempt.score} />

                <div className="space-y-6">
                    {test.questions.map((q: any, idx: number) => {
                        const reflection = result.reflections.find((r: any) => r.questionId === q.id);
                        const isCorrect = reflection?.isCorrect;
                        const userAnswerId = answers[q.id];

                        return (
                            <Card key={q.id} className={cn("border", isCorrect ? "border-green-200" : "border-red-200")}>
                                <CardHeader>
                                    <h3 className="font-medium text-lg">
                                        {idx + 1}. <MathRenderer text={q.text} />
                                    </h3>
                                    {q.imageUrl && <img src={q.imageUrl} alt="Question" className="mt-2 max-h-60 rounded-md object-contain" />}
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
                                                <div className="flex flex-col gap-1 w-full">
                                                    <span className="flex-1"><MathRenderer text={opt.text} /></span>
                                                    {opt.imageUrl && <img src={opt.imageUrl} alt="Option" className="max-h-32 w-fit rounded border bg-white" />}
                                                </div>
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

    if (!hasStarted) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                <Card className="border-2 border-indigo-100 shadow-xl overflow-hidden">
                    <div className="bg-indigo-600 p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">{test.title}</h1>
                        <p className="opacity-90">Please read the instructions carefully before starting the assessment.</p>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Duration</p>
                                <p className="text-xl font-bold">{test.duration} Minutes</p>
                            </div>
                            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Questions</p>
                                <p className="text-xl font-bold">{test.questions?.length || 0} Total</p>
                            </div>
                        </div>

                        <div className="prose prose-indigo max-w-none">
                            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Instructions</h3>
                            {test.instructions ? (
                                <div className="text-zinc-700 whitespace-pre-wrap leading-relaxed">
                                    {test.instructions}
                                </div>
                            ) : (
                                <ul className="list-disc list-inside space-y-2 text-zinc-600">
                                    <li>Ensure you have a stable internet connection.</li>
                                    <li>Once started, the timer cannot be paused.</li>
                                    <li>The test will auto-submit when the time runs out.</li>
                                    <li>Do not refresh the page or navigate away.</li>
                                </ul>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t flex flex-col items-center gap-4 text-center">
                            <p className="text-sm text-zinc-500 italic">By clicking "Start Assessment", you agree to follow the rules of this test.</p>
                            <Button
                                size="lg"
                                className="w-full md:w-64 h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-1"
                                onClick={() => setHasStarted(true)}
                            >
                                Start Assessment
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = test.questions[currentQuestionIndex];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
            {/* Main Question Area */}
            <div className="flex-1 space-y-6 order-2 lg:order-1">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm sticky top-4 z-10 lg:hidden">
                    <h2 className="font-bold">Q{currentQuestionIndex + 1}</h2>
                    <div className={cn("font-mono font-bold", timeLeft < 60 ? "text-red-500" : "text-primary")}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <Card key={currentQuestion.id} className="border-2 border-zinc-100 shadow-md">
                    <CardHeader className="bg-zinc-50/50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {test.questions.length}</span>
                        </div>
                        <CardTitle className="text-xl font-medium leading-relaxed">
                            <MathRenderer text={currentQuestion.text} />
                        </CardTitle>
                        {currentQuestion.imageUrl && <img src={currentQuestion.imageUrl} alt="Question" className="mt-4 max-h-60 rounded-md object-contain border bg-white" />}
                    </CardHeader>
                    <CardContent className="space-y-3 p-6">
                        {currentQuestion.options.map((opt: any) => (
                            <div key={opt.id} className="flex items-center space-x-2">
                                <div
                                    className={cn(
                                        "flex items-center w-full p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        answers[currentQuestion.id] === opt.id
                                            ? "border-indigo-600 bg-indigo-50 shadow-sm"
                                            : "border-zinc-100 hover:border-indigo-200 hover:bg-zinc-50"
                                    )}
                                    onClick={() => handleSelect(currentQuestion.id, opt.id)}
                                >
                                    <div className={cn(
                                        "h-5 w-5 rounded-full border-2 border-indigo-200 mr-4 flex items-center justify-center transition-colors",
                                        answers[currentQuestion.id] === opt.id ? "border-indigo-600 bg-indigo-600" : "bg-white"
                                    )}>
                                        {answers[currentQuestion.id] === opt.id && <div className="h-2 w-2 rounded-full bg-white" />}
                                    </div>
                                    <div className="flex flex-col gap-1 w-full">
                                        <Label className="cursor-pointer font-medium text-zinc-800"><MathRenderer text={opt.text} /></Label>
                                        {opt.imageUrl && <img src={opt.imageUrl} alt="Option" className="max-h-32 w-fit rounded border bg-white mt-2" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="bg-zinc-50/50 border-t p-6 flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>
                        {currentQuestionIndex === test.questions.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 px-8"
                            >
                                {submitting ? 'Submitting...' : 'Finish Assessment'}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
                            >
                                Save & Next
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* Sidebar Navigation */}
            <div className="w-full lg:w-80 space-y-6 order-1 lg:order-2">
                <Card className="sticky top-4 border-2 border-zinc-100 shadow-lg">
                    <CardHeader className="bg-zinc-900 text-white rounded-t-lg">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Assessment Status</CardTitle>
                            <Clock className="h-5 w-5 opacity-80" />
                        </div>
                        <div className="text-3xl font-mono font-bold text-center py-2">
                            {formatTime(timeLeft)}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                        <div className="grid grid-cols-5 gap-2">
                            {test.questions.map((q: any, idx: number) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={cn(
                                        "h-10 rounded-md text-xs font-bold transition-all border-2",
                                        currentQuestionIndex === idx
                                            ? "border-indigo-600 bg-indigo-600 text-white scale-110 z-10 shadow-md"
                                            : answers[q.id]
                                                ? "border-green-500 bg-green-50 text-green-700"
                                                : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
                                    )}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-3 w-3 bg-green-500 rounded-sm"></div>
                                <span className="text-zinc-600">Answered: {Object.keys(answers).length}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-3 w-3 border-2 border-zinc-200 rounded-sm"></div>
                                <span className="text-zinc-600">Remaining: {test.questions.length - Object.keys(answers).length}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-0"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            Submit Assessment
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
