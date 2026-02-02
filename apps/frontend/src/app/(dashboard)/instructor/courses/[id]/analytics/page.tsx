"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users, DollarSign, TrendingUp, Clock,
    ArrowLeft, BookOpen, CheckCircle2, PlayCircle, XCircle
} from "lucide-react";
import Link from "next/link";

interface CourseAnalytics {
    overview: {
        totalEnrollments: number;
        totalRevenue: number;
        completionRate: number;
        averageRating: number;
        totalLessons: number;
    };
    completionFunnel: {
        completed: number;
        inProgress: number;
        notStarted: number;
    };
    watchTime: {
        total: number;
        average: number;
    };
    students: Array<{
        userId: string;
        userName: string;
        userEmail: string;
        completedLessons: number;
        totalWatchTime: number;
        progressPercentage: number;
    }>;
    topLessons: Array<{
        id: string;
        title: string;
        count: number;
        duration: number;
    }>;
    courseInfo: {
        title: string;
        type: string;
        price: number;
        isPublished: boolean;
    };
}

export default function CourseAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const courseId = params.id as string;

    useEffect(() => {
        if (token && courseId) {
            api.get(`/courses/${courseId}/analytics`, token)
                .then(setAnalytics)
                .catch(err => {
                    console.error('Failed to fetch analytics', err);
                    setError('Failed to load analytics');
                })
                .finally(() => setLoading(false));
        }
    }, [token, courseId]);

    if (loading) {
        return <div className="text-center py-12">Loading analytics...</div>;
    }

    if (error || !analytics) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error || 'Failed to load analytics'}</p>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const formatMinutes = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">{analytics.courseInfo.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${analytics.courseInfo.isPublished
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            }`}>
                            {analytics.courseInfo.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            {analytics.courseInfo.type}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            ₹{analytics.courseInfo.price.toLocaleString()}
                        </span>
                    </div>
                </div>
                <Link href={`/instructor/courses/${courseId}/edit`}>
                    <Button variant="outline">Edit Course</Button>
                </Link>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.overview.totalEnrollments}</div>
                        <p className="text-xs text-muted-foreground">Students enrolled</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{analytics.overview.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From all enrollments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.overview.completionRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.completionFunnel.completed} of {analytics.overview.totalEnrollments} completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Watch Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMinutes(analytics.watchTime.average)}</div>
                        <p className="text-xs text-muted-foreground">Per student</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.overview.totalLessons}</div>
                        <p className="text-xs text-muted-foreground">Course content</p>
                    </CardContent>
                </Card>
            </div>

            {/* Completion Funnel */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Progress Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center gap-4 p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                            <div className="p-3 rounded-full bg-green-500/10">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics.completionFunnel.completed}</p>
                                <p className="text-sm text-muted-foreground">Completed</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                            <div className="p-3 rounded-full bg-blue-500/10">
                                <PlayCircle className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics.completionFunnel.inProgress}</p>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg border bg-gray-500/5 border-gray-500/20">
                            <div className="p-3 rounded-full bg-gray-500/10">
                                <XCircle className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics.completionFunnel.notStarted}</p>
                                <p className="text-sm text-muted-foreground">Not Started</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Lessons */}
                <Card>
                    <CardHeader>
                        <CardTitle>Most Popular Lessons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.topLessons.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No lesson completions yet</p>
                        ) : (
                            <div className="space-y-3">
                                {analytics.topLessons.map((lesson, index) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{lesson.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {lesson.duration ? formatMinutes(lesson.duration) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{lesson.count}</p>
                                            <p className="text-xs text-muted-foreground">completions</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Watch Time Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Watch Time Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Watch Time</span>
                                    <span className="text-2xl font-bold">{formatMinutes(analytics.watchTime.total)}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Average per Student</span>
                                    <span className="text-2xl font-bold">{formatMinutes(analytics.watchTime.average)}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Engagement Rate</span>
                                    <span className="text-2xl font-bold">
                                        {analytics.overview.totalEnrollments > 0
                                            ? Math.round((analytics.completionFunnel.completed + analytics.completionFunnel.inProgress) / analytics.overview.totalEnrollments * 100)
                                            : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Student Progress Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Progress Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {analytics.students.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No student progress data yet</p>
                    ) : (
                        <div className="space-y-2">
                            {analytics.students.map((student) => (
                                <div key={student.userId} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium">{student.userName}</p>
                                        <p className="text-sm text-muted-foreground">{student.userEmail}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{student.completedLessons} / {analytics.overview.totalLessons}</p>
                                            <p className="text-xs text-muted-foreground">Lessons completed</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{formatMinutes(student.totalWatchTime)}</p>
                                            <p className="text-xs text-muted-foreground">Watch time</p>
                                        </div>
                                        <div className="w-24">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${student.progressPercentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold w-10 text-right">
                                                    {student.progressPercentage}%
                                                </span>
                                            </div>
                                        </div>
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
