"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, FileText, UserPlus, DollarSign, LayoutTemplate, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    const { token, user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isInstructor = user?.role === 'INSTRUCTOR';

    useEffect(() => {
        if (!token) return;

        const endpoint = isInstructor ? '/activity/instructor' : '/history';

        api.get(endpoint, token)
            .then(data => {
                // Ensure array
                setHistory(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Failed to fetch history:", err);
                setHistory([]);
            })
            .finally(() => setLoading(false));
    }, [token, isInstructor]);

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="text-zinc-500 animate-pulse">Loading activity log...</div>
        </div>
    );

    /* INSTRUCTOR VIEW - Professional Audit Log Style */
    if (isInstructor) {
        return (
            <div className="container mx-auto p-6 space-y-6 max-w-5xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                    <p className="text-muted-foreground">Audit trail of your actions and student enrollments.</p>
                </div>

                <Card>
                    <CardHeader className="pb-3 border-b border-white/5">
                        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                        <CardDescription>Real-time updates from your platform usage.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No activity recorded yet. Start by publishing a course!
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {history.map((item) => {
                                    // Dynamic icon selection based on type
                                    let Icon = FileText;
                                    let iconColor = "text-zinc-400";
                                    let iconBg = "bg-zinc-500/10";

                                    if (item.type === 'course_published') {
                                        Icon = LayoutTemplate;
                                        iconColor = "text-violet-400";
                                        iconBg = "bg-violet-400/10";
                                    } else if (item.type === 'student_enrolled') {
                                        Icon = UserPlus;
                                        iconColor = "text-emerald-400";
                                        iconBg = "bg-emerald-400/10";
                                    }

                                    return (
                                        <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-white/5 transition-colors">
                                            <div className={cn("p-2 rounded-lg shrink-0", iconBg)}>
                                                <Icon className={cn("h-4 w-4", iconColor)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-4">
                                                    <p className="font-medium text-sm truncate">{item.title}</p>
                                                    <span className="text-xs text-zinc-500 whitespace-nowrap font-mono">
                                                        {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    /* STUDENT VIEW (Existing) */
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Learning History</h1>
                <p className="text-muted-foreground">Track your test attempts and course completions.</p>
            </div>

            <div className="grid gap-4">
                {history.map((attempt) => (
                    <Card key={attempt.id} className={attempt.passed ? "border-l-4 border-l-green-500 bg-white/5" : "border-l-4 border-l-red-500 bg-white/5"}>
                        <CardHeader className="py-4">
                            <CardTitle className="text-lg flex justify-between items-center">
                                <span>{attempt.test.title}</span>
                                <span className={attempt.passed ? "text-green-500 flex items-center gap-1 text-sm bg-green-500/10 px-2 py-1 rounded" : "text-red-500 flex items-center gap-1 text-sm bg-red-500/10 px-2 py-1 rounded"}>
                                    {attempt.passed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    {attempt.passed ? "Passed" : "Failed"} ({attempt.score} pts)
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground flex justify-between">
                            <span>Course ID: {attempt.test.courseId}</span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </CardContent>
                    </Card>
                ))}

                {history.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border rounded-xl border-dashed border-white/10 bg-white/5">
                        <div className="p-4 bg-zinc-900 rounded-full">
                            <FileText className="h-8 w-8 text-zinc-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-white">No attempts yet</h3>
                            <p className="text-zinc-400">Enrol in a course and take a test to see your history here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
