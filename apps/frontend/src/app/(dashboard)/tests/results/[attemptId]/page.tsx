"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Trophy, BarChart3, Clock, ArrowRight, Target } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResultData {
    id: string;
    score: number;
    status: string;
    completedAt: string;
    totalPoints: number;
    passed: boolean;
    rank: number;
    totalParticipants: number;
    test: {
        id: string;
        title: string;
        passMarks: number;
        questions: any[];
    };
    responses: Record<string, string>;
    timeSpent?: Record<string, number>;
}

export default function ResultDashboardPage() {
    const { token } = useAuth();
    const params = useParams(); // attemptId
    const router = useRouter();
    const [result, setResult] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !params.attemptId) return;

        api.get(`/tests/attempt/${params.attemptId}/result`, token)
            .then(data => setResult(data))
            .catch(err => {
                console.error("Failed to fetch result", err);
                toast.error("Failed to load test results");
            })
            .finally(() => setLoading(false));
    }, [token, params.attemptId]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-medium">Crunching your numbers...</h3>
                <p className="text-muted-foreground">Checking answers and calculating ranks.</p>
            </div>
        );
    }

    if (!result) return <div className="p-8 text-center">Result not found.</div>;

    const percentage = Math.round((result.score / result.totalPoints) * 100) || 0;
    const isTop10 = result.rank <= Math.ceil(result.totalParticipants * 0.1);
    const totalTimeSpent = result.timeSpent ? Object.values(result.timeSpent).reduce((a, b) => a + b, 0) : 0;

    // Quick Stats Calculations
    const attemptedCount = Object.keys(result.responses || {}).length;
    const totalQuestions = result.test.questions?.length || 0;

    // This assumes backend sends back exact correctness per question, but for now we calculate basic correct vs incorrect if possible. 
    // Actual implementation in a real app would have the backend return an array of { questionId, isCorrect, pointsEarned, selectedOption, correctOption }
    // As a placeholder, we just show raw counts

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
                    <p className="text-muted-foreground">Detailed breakdown of your performance in {result.test.title}.</p>
                </div>
                <Button variant="outline" onClick={() => router.push(`/courses/${result.test.id}`)}>
                    Back to Course
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Score Card */}
                <Card className="md:col-span-2 shadow-lg border-2 border-primary/10 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                            {result.passed ? (
                                <><CheckCircle className="text-green-500 h-6 w-6" /> Test Passed</>
                            ) : (
                                <><XCircle className="text-red-500 h-6 w-6" /> Test Failed</>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center justify-between py-6">
                        <div className="text-center md:text-left mb-6 md:mb-0 space-y-2">
                            <p className="text-5xl font-black text-primary">
                                {result.score} <span className="text-2xl text-muted-foreground font-semibold">/ {result.totalPoints}</span>
                            </p>
                            <p className="text-lg text-muted-foreground">
                                Score ({percentage}%)
                            </p>
                        </div>

                        <div className="flex gap-8 text-center">
                            <div className="space-y-1">
                                <p className="text-3xl font-bold">{attemptedCount}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Attempted</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-bold">{totalQuestions - attemptedCount}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Skipped</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-bold">{Math.floor(totalTimeSpent / 60)}<span className="text-lg">m</span></p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Time Spent</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rank Card */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900/50">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center text-lg">
                            Leaderboard
                            <Trophy className={`h-5 w-5 ${isTop10 ? "text-yellow-500" : "text-indigo-400"}`} />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-6">
                        <div className="text-5xl font-black text-indigo-900 dark:text-indigo-100 mb-2">
                            #{result.rank}
                        </div>
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            out of {result.totalParticipants} students
                        </p>

                        {isTop10 && (
                            <div className="mt-4 inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                                Top 10%
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="review" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="review">Question Review</TabsTrigger>
                    <TabsTrigger value="analytics" disabled>Detailed Analytics (Coming Soon)</TabsTrigger>
                </TabsList>

                <TabsContent value="review" className="mt-6 space-y-6">
                    {/* Placeholder for question-by-question review until backend returns full correct answer details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Attempt Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-muted-foreground">Question-by-question review allows you to see which answers were correct and read explanations.</p>
                                <p className="font-medium text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    Note: Detailed question review mode requires backend `correctOptionId` exposure which is currently hidden for security during active testing windows. Ask your instructor to publish test answers.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
