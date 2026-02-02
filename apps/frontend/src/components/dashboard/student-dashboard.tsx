"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Clock, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function StudentDashboard({ user, token }: { user: any, token: string | null }) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.get('/student/stats', token)
                .then(setStats)
                .catch(() => setStats({})) // Fallback
                .finally(() => setLoading(false));
        }
    }, [token]);

    const statsCards = [
        { title: "Enrolled Courses", value: stats?.enrolledCourses || 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Lessons Completed", value: stats?.completedLessons || 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
        { title: "Average Score", value: `${stats?.averageScore || 0}%`, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { title: "Goals Met", value: "On Track", icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        Welcome back, {user.name?.split(' ')[0] || 'Student'}!
                    </h1>
                    <p className="text-muted-foreground mt-1">Here's an overview of your learning progress.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/courses">
                        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Resume Learning</Button>
                    </Link>
                </div>
            </div>

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
                                Keep going!
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest learning milestones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {(stats?.recentActivity?.length > 0) ? stats.recentActivity.map((activity: any, i: number) => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm text-green-600">Done</div>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-sm">No recent activity found. Start a course!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/0 border-l-4 border-l-primary/20">
                    <CardHeader>
                        <CardTitle>Recommended for You</CardTitle>
                        <CardDescription>Based on your interests.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-background rounded-lg border shadow-sm flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors">
                            <div>
                                <h4 className="font-semibold group-hover:text-primary transition-colors">Advanced Statistics</h4>
                                <p className="text-xs text-muted-foreground">Intermediate • 4h 30m</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
