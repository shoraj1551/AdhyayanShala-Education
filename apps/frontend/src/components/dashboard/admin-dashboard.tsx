"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Server, AlertCircle, Activity, ShieldCheck, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminDashboard({ user }: { user: any }) {
    // Mock data for initial preview
    const stats = {
        totalUsers: 8450,
        serverUptime: "99.9%",
        pendingApprovals: 12,
        systemHealth: "Healthy"
    };

    const statsCards = [
        { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "System Health", value: stats.systemHealth, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "Pending Approvals", value: stats.pendingApprovals, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
        { title: "Server Uptime", value: stats.serverUptime, icon: Server, color: "text-purple-500", bg: "bg-purple-500/10" },
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
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-2 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Content Moderation Queue</CardTitle>
                        <CardDescription>Courses and reviews waiting for approval.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">New Course Submission: "Intro to Python"</p>
                                            <p className="text-xs text-muted-foreground">Submitted by Instructor Mark • 2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">Approve</Button>
                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">Reject</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
