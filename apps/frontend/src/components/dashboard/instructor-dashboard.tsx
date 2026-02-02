"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface InstructorStats {
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    courses: Array<{
        id: string;
        title: string;
        enrollmentCount: number;
        price: number;
        isPublished: boolean;
        type: string;
    }>;
}

export function InstructorDashboard({ user }: { user: any }) {
    const { token } = useAuth();
    const [stats, setStats] = useState<InstructorStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.get('/courses/instructor/stats', token)
                .then(setStats)
                .catch(err => console.error('Failed to fetch instructor stats', err))
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (loading) {
        return <div className="text-center py-12">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="text-center py-12">Failed to load dashboard data</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back, {user.name}!</p>
                </div>
                <Link href="/instructor/create">
                    <Button>Create New Course</Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.publishedCourses} published
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all courses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            From {stats.totalEnrollments} enrollments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Enrollment</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalCourses > 0
                                ? Math.round(stats.totalEnrollments / stats.totalCourses)
                                : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per course
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Course Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.courses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="mb-4">You haven't created any courses yet.</p>
                            <Link href="/instructor/create">
                                <Button variant="outline">Create Your First Course</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{course.title}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${course.isPublished
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                }`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                {course.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {course.enrollmentCount} students
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                ₹{course.price.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                Revenue: ₹{(course.enrollmentCount * course.price).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/instructor/courses/${course.id}/analytics`}>
                                            <Button variant="default" size="sm">
                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                Analytics
                                            </Button>
                                        </Link>
                                        <Link href={`/instructor/courses/${course.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
