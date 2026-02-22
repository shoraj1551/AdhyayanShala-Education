"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Clock, FileWarning, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

interface TestPreview {
    id: string;
    title: string;
    duration: number;
    instructions: string;
    totalMarks: number;
    passMarks: number;
    _count?: { questions: number };
}

interface TestPlayerProps {
    testId: string;
    onComplete?: (score: number, passed: boolean) => void;
}

export function TestPlayer({ testId }: TestPlayerProps) {
    const { token } = useAuth();
    const [test, setTest] = useState<TestPreview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!testId || !token) return;
        setLoading(true);

        api.get(`/tests/${testId}`, token)
            .then(data => {
                setTest(data);
            })
            .catch(err => {
                console.error("Failed to load test", err);
                toast.error("Failed to load test data");
            })
            .finally(() => setLoading(false));
    }, [testId, token]);

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!test) {
        return <div className="text-center p-8">Test not found.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
            <Card className="w-full text-center shadow-lg border-2 border-primary/20 bg-card/50 backdrop-blur">
                <CardHeader className="pb-4">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <FileText className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold">{test.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center gap-6 text-sm">
                        <div className="flex flex-col items-center">
                            <FileWarning className="h-5 w-5 mb-1 text-muted-foreground" />
                            <span className="font-semibold text-lg">{test._count?.questions || 0}</span>
                            <span className="text-muted-foreground">Questions</span>
                        </div>
                        <div className="w-px bg-border"></div>
                        <div className="flex flex-col items-center">
                            <Clock className="h-5 w-5 mb-1 text-muted-foreground" />
                            <span className="font-semibold text-lg">{test.duration}</span>
                            <span className="text-muted-foreground">Minutes</span>
                        </div>
                        <div className="w-px bg-border"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-primary mb-1 mt-auto leading-none">{test.totalMarks}</span>
                            <span className="text-muted-foreground">Total Marks</span>
                        </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg text-left mt-6">
                        <h4 className="font-semibold mb-2 line-clamp-1">Instructions</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                            {test.instructions || "Click 'Start Test' below to begin your attempt. The timer will start immediately."}
                        </p>
                    </div>

                    <Button size="lg" className="w-full sm:w-auto px-8 gap-2 group mt-4 font-semibold text-lg" asChild>
                        <Link href={`/test/${test.id}/start`} target="_blank">
                            Start Quiz Attempt
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                        * The test will open in a new full-screen window to prevent distractions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
