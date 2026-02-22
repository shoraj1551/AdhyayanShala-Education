"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Server, AlertCircle, Activity, Settings, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface DashboardStats {
    users: { total: number; students: number; instructors: number };
    revenue: number;
    courses: { total: number; published: number };
}

interface PendingCourse {
    id: string;
    title: string;
    createdAt: string;
    instructor?: {
        name: string;
    };
}

export function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [statsData, coursesData] = await Promise.all([
                api.get('/admin/analytics/dashboard', token || undefined),
                api.get('/admin/courses?status=DRAFT&limit=5', token || undefined)
            ]);
            setStats(statsData);
            setPendingCourses(coursesData.courses || []);
        } catch (err) {
            console.error("Failed to fetch admin dashboard data:", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (courseId: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') {
                await api.patch(`/admin/courses/${courseId}/status`, { isPublished: true }, token || undefined);
                toast.success("Course approved and published!");
            } else {
                await api.patch(`/admin/courses/${courseId}/status`, { isPublished: false }, token || undefined);
                toast.info("Course rejected (kept as draft)");
            }
            fetchData(); // Refresh
        } catch (err) {
            console.error("Action error:", err);
            toast.error("Action failed");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
        );
    }

    const statsCards = [
        { title: "Total Users", value: stats?.users?.total || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", desc: `${stats?.users?.students || 0} Students` },
        { title: "Active Courses", value: stats?.courses?.published || 0, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: `Out of ${stats?.courses?.total || 0}` },
        { title: "Pending Moderation", value: pendingCourses.length, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Draft courses" },
        { title: "Total Revenue", value: `₹${(stats?.revenue || 0).toLocaleString()}`, icon: Server, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Lifetime verified" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
                        Admin Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">Platform monitoring and user management.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/settings">
                        <Button variant="outline" className="border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/20">
                            <Settings className="mr-2 h-4 w-4" /> Platform Settings
                        </Button>
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
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{stat.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-2 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Content Moderation Queue</CardTitle>
                        <CardDescription>Courses waiting for approval.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingCourses.length > 0 ? (
                                pendingCourses.map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 text-amber-600 rounded">
                                                <AlertCircle className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{course.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Submitted by {course.instructor?.name || "Unknown"} • {new Date(course.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                                onClick={() => handleAction(course.id, 'approve')}
                                            >
                                                <Check className="h-4 w-4 mr-1" /> Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleAction(course.id, 'reject')}
                                            >
                                                <X className="h-4 w-4 mr-1" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No courses pending approval.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
