"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, FileText, UserPlus, LayoutTemplate, Calendar, Trophy, Shield, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

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
                setHistory(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Failed to fetch history:", err);
                setHistory([]);
            })
            .finally(() => setLoading(false));
    }, [token, isInstructor]);

    const stats = [
        {
            label: "Total Completions",
            value: history.filter(h => h.type === 'COURSE_COMPLETION').length,
            icon: Trophy,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            label: "Tests Passed",
            value: history.filter(h => h.type === 'TEST_ATTEMPT' && h.passed).length,
            icon: CheckCircle,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            label: "Avg. Score",
            value: history.length > 0
                ? Math.round(history.reduce((acc, curr) => acc + (curr.score || 0), 0) / history.length)
                : 0,
            icon: FileText,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            <div className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Syncing Records...</div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Standard Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                        {isInstructor ? "Activity Log" : "Learning History"}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        {isInstructor
                            ? "Review a complete audit trail of your platform interactions and student enrollments."
                            : "A comprehensive timeline of your academic achievements, milestones, and progress."}
                    </p>
                </div>
            </div>

            {/* Stats Bar - Professional Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
                        <CardContent className="p-6 flex items-center gap-6">
                            <div className={cn("p-4 rounded-2xl", stat.bg)}>
                                <stat.icon className={cn("h-8 w-8", stat.color)} />
                            </div>
                            <div>
                                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                                <p className="text-3xl font-bold tracking-tight text-zinc-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Timeline List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full" />
                        Platform Timeline
                    </h2>
                    <span className="text-muted-foreground font-semibold text-sm">{history.length} event{history.length !== 1 ? 's' : ''} recorded</span>
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-zinc-200 shadow-sm">
                        <div className="p-4 bg-zinc-50 rounded-full inline-block mb-4">
                            <Clock className="h-12 w-12 text-zinc-300" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900">No activity yet</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Your journey starts here. Take your first lesson or enroll in a course to see your progress.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item) => {
                            let Icon = FileText;
                            let iconColor = "text-blue-500";
                            let iconBg = "bg-blue-500/10";

                            if (item.type === 'COURSE_COMPLETION' || item.type === 'course_published') {
                                Icon = Trophy;
                                iconColor = "text-emerald-500";
                                iconBg = "bg-emerald-500/10";
                            } else if (item.type === 'student_enrolled' || item.type === 'ENROLLMENT') {
                                Icon = UserPlus;
                                iconColor = "text-indigo-500";
                                iconBg = "bg-indigo-500/10";
                            }

                            return (
                                <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                            <div className={cn("p-4 rounded-xl shrink-0 transition-transform group-hover:scale-105", iconBg)}>
                                                <Icon className={cn("h-6 w-6", iconColor)} />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                    <h3 className="text-lg font-bold text-zinc-900 truncate group-hover:text-primary transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-widest bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(item.timestamp || item.date), 'MMM d, yyyy • h:mm a')}
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground text-sm font-medium line-clamp-1">{item.description}</p>
                                            </div>

                                            {item.score !== undefined && (
                                                <div className="hidden md:block text-right px-6 border-l border-zinc-100">
                                                    <div className="text-xl font-bold text-zinc-900">{item.score} pts</div>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        {item.passed ? "Passed" : "Attempted"}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="md:pl-4">
                                                <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
