"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, IndianRupee, BookOpen, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function InstructorDashboard({ user }: { user: any }) {
    // Initial State: Fresh Account (All Zeros)
    // TODO: Connect to fetching logic in Step 3
    const stats = {
        totalStudents: 0,
        activeCourses: 0,
        totalRevenue: 0,
        rating: 0 // New instructor has no rating yet
    };

    const statsCards = [
        { title: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Active Courses", value: stats.activeCourses, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-amber-500", bg: "bg-amber-500/10" },
        { title: "Instructor Rating", value: stats.rating > 0 ? stats.rating : "N/A", icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-500/10" },
    ];

    const topCourses: any[] = []; // No courses yet
    const recentEnrollments: any[] = []; // No enrollments yet

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                        Instructor Hub
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your courses and track performance.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/instructor/create">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                            <Plus className="mr-2 h-4 w-4" /> Create New Course
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
                            {stats.activeCourses > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    +0% from last month
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State / Welcome Logic */}
            {stats.activeCourses === 0 ? (
                <div className="border border-dashed border-zinc-700 rounded-xl p-12 text-center bg-zinc-900/30">
                    <div className="mx-auto h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
                        <BookOpen className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Start Your Teaching Journey</h3>
                    <p className="text-zinc-400 max-w-md mx-auto mb-8">
                        You haven't created any courses yet. Share your knowledge with the world and start earning today.
                    </p>
                    <Link href="/instructor/create">
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xl shadow-emerald-900/20 transition-all hover:scale-105">
                            <Plus className="mr-2 h-5 w-5" />
                            Create Your First Course
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Top Courses & Enrollments Code (Hidden for Zero State) */}
                    <Card className="border-none shadow-md">
                        {/* ... Existing populated logic would go here if we had data ... */}
                        <CardHeader>
                            <CardTitle>Your Top Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">No data available</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Recent Enrollments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">No data available</div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
