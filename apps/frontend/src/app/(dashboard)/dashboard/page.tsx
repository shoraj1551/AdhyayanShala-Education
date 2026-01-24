"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Clock, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function Dashboard() {
    const { user, token, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.get('/student/stats', token)
                .then(setStats)
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (authLoading || loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
    }

    if (!user) return null;

    const statsCards = [
        { title: "Enrolled Courses", value: stats?.enrolledCourses || 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Lessons Completed", value: stats?.completedLessons || 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
        { title: "Average Score", value: `${stats?.averageScore || 0}%`, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { title: "Goals Met", value: "On Track", icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimal Header Section */}
            {user.role === 'GUEST' && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-6 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400">
                        <ArrowRight className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-indigo-400">You are browsing as a Guest</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your progress is temporary. Enrolled courses (Max 2) and Test results (Max 1) will be lost if you clear your browser.
                            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 ml-1 font-medium underline underline-offset-4">
                                Create an account to save progress.
                            </Link>
                        </p>
                    </div>
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        Welcome back, {user.name?.split(' ')[0] || 'Student'}!
                    </h1>
                    <p className="text-muted-foreground mt-1">Here's an overview of your learning progress today.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/courses">
                        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Resume Learning</Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, i) => (
                    <Card key={i} className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-2 rounded-full", stat.bg)}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Keep up the good work!
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your latest learning milestones.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((activity: any, i: number) => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.type === 'TEST' ? 'Completed Assessment' : 'Completed Lesson'}: "{activity.title}"
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm text-green-600">
                                        {activity.score ? `Score: ${activity.score}%` : 'Done'}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-sm">No recent activity found. Start a course!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="col-span-3 border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/0 border-l-4 border-l-primary/20">
                    <CardHeader>
                        <CardTitle>Recommended for You</CardTitle>
                        <CardDescription>
                            Based on your recent tests.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-background rounded-lg border shadow-sm flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors">
                            <div>
                                <h4 className="font-semibold group-hover:text-primary transition-colors">Advanced Statistics</h4>
                                <p className="text-xs text-muted-foreground">Intermediate • 4h 30m</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="p-4 bg-background rounded-lg border shadow-sm flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors">
                            <div>
                                <h4 className="font-semibold group-hover:text-primary transition-colors">Machine Learning 101</h4>
                                <p className="text-xs text-muted-foreground">Beginner • 6h 15m</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
