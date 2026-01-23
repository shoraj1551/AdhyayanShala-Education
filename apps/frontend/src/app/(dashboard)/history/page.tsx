"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function HistoryPage() {
    const { token } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.get('/history', token)
                .then(setHistory)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (loading) return <div className="p-8">Loading history...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">My Learning History</h1>

            <div className="grid gap-4">
                {history.map((attempt) => (
                    <Card key={attempt.id} className={attempt.passed ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}>
                        <CardHeader className="py-4">
                            <CardTitle className="text-lg flex justify-between">
                                <span>{attempt.test.title}</span>
                                <span className={attempt.passed ? "text-green-600 flex items-center gap-1" : "text-red-600 flex items-center gap-1"}>
                                    {attempt.passed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    {attempt.passed ? "Passed" : "Failed"} ({attempt.score} pts)
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground flex justify-between">
                            <span>Course ID: {attempt.test.courseId}</span>
                            {/* Ideally Fetch course title if not populated, but service populated it. */}
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </CardContent>
                    </Card>
                ))}

                {history.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground bg-muted/20">
                        No attempts yet. Enrol in a course and take a test!
                    </div>
                )}
            </div>
        </div>
    );
}
