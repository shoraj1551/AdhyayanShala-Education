"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, FileText, UserPlus, LayoutTemplate, Calendar, Trophy, Shield } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="h-12 w-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
            <div className="text-zinc-500 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Learning Records...</div>
        </div>
    );

    /* INSTRUCTOR VIEW - Professional Audit Log Style */
    if (isInstructor) {
        return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto px-4 py-10">
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 md:p-12 shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                    <div className="relative space-y-4">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            Activity <span className="text-primary italic">Log</span>
                        </h1>
                        <p className="text-zinc-400 text-base max-w-md font-medium">Complete audit trail of platform interactions and enrollments.</p>
                    </div>
                </div>

                <Card className="border-2 border-white/50 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="p-8 border-b border-zinc-100/50 bg-white/20">
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <LayoutTemplate className="text-primary" />
                            Recent activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {history.length === 0 ? (
                            <div className="p-20 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                                    <Clock size={32} />
                                </div>
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No activity recorded yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100/50">
                                {history.map((item) => {
                                    let Icon = FileText;
                                    let iconColor = "text-zinc-400";
                                    let iconBg = "bg-zinc-100";

                                    if (item.type === 'course_published') {
                                        Icon = LayoutTemplate;
                                        iconColor = "text-violet-600";
                                        iconBg = "bg-violet-50";
                                    } else if (item.type === 'student_enrolled') {
                                        Icon = UserPlus;
                                        iconColor = "text-emerald-600";
                                        iconBg = "bg-emerald-50";
                                    }

                                    return (
                                        <div key={item.id} className="group flex items-center gap-6 p-6 hover:bg-white/60 transition-all">
                                            <div className={cn("p-4 rounded-2xl shrink-0 shadow-sm transform group-hover:scale-110 transition-transform", iconBg)}>
                                                <Icon className={cn("h-6 w-6", iconColor)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-4">
                                                    <p className="font-black text-lg text-zinc-900 truncate">{item.title}</p>
                                                    <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-widest bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                                                        <Calendar size={12} />
                                                        {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                                                    </div>
                                                </div>
                                                <p className="text-zinc-500 font-medium mt-1">{item.description}</p>
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

    /* STUDENT VIEW */
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 md:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="relative space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                        Learning <span className="text-primary italic">History</span>
                    </h1>
                    <p className="text-zinc-400 text-base max-w-md font-medium">A visual timeline of your academic achievements and milestones.</p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-2 border-white/50 bg-white/40 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden transition-all hover:translate-y-[-4px]">
                        <CardContent className="p-6 flex items-center gap-6">
                            <div className={cn("p-4 rounded-2xl shadow-sm", stat.bg)}>
                                <stat.icon className={cn("h-8 w-8", stat.color)} />
                            </div>
                            <div>
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                                <p className="text-3xl font-black tracking-tight text-zinc-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase tracking-widest text-sm flex items-center gap-2">
                        <div className="w-2 h-6 bg-primary rounded-full" />
                        Timeline
                    </h2>
                </div>

                {history.map((item) => (
                    <Card key={item.id} className={cn(
                        "group border-2 border-white/50 bg-white/40 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden transition-all hover:bg-white/60",
                        item.type === 'COURSE_COMPLETION' ? "hover:shadow-emerald-500/10" : "hover:shadow-primary/10"
                    )}>
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                                <div className={cn(
                                    "p-6 rounded-3xl shadow-inner transform group-hover:rotate-6 transition-all duration-500 shrink-0",
                                    item.type === 'COURSE_COMPLETION' ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                                )}>
                                    {item.type === 'COURSE_COMPLETION' ? (
                                        <Trophy className="h-10 w-10" />
                                    ) : (
                                        <FileText className="h-10 w-10" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h3 className="text-2xl font-black tracking-tight text-zinc-900 truncate">{item.title}</h3>
                                        <span className={cn(
                                            "flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border shadow-sm self-start md:self-center",
                                            item.type === 'COURSE_COMPLETION' ? "text-emerald-600 bg-emerald-50 border-emerald-100" :
                                                item.passed ? "text-blue-600 bg-blue-50 border-blue-100" : "text-red-600 bg-red-50 border-red-100"
                                        )}>
                                            {item.type === 'COURSE_COMPLETION' ? (
                                                <><CheckCircle className="h-4 w-4" /> COMPLETED</>
                                            ) : (
                                                <>{item.passed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {item.passed ? "PASSED" : "FAILED"}</>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase tracking-widest">
                                            <Calendar size={14} className="text-zinc-400" />
                                            {item.date ? format(new Date(item.date), 'MMM d, yyyy') : 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase tracking-widest">
                                            <Shield size={14} className="text-zinc-400" />
                                            {item.type === 'COURSE_COMPLETION' ? 'Status: Certified' : `Score: ${item.score} pts`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {history.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6 border-4 border-dashed border-zinc-100 rounded-[40px] bg-zinc-50/30">
                        <div className="p-8 bg-white shadow-2xl rounded-full text-zinc-300">
                            <LayoutTemplate size={48} />
                        </div>
                        <div className="max-w-md mx-auto space-y-2">
                            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">No achievements yet</h3>
                            <p className="text-zinc-500 font-medium">Your learning journey starts with your first enrollment. Take a course and conquer your first test!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
