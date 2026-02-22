"use client";

import { useEffect, useState } from "react";
import { getInstructorDashboardData } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, TrendingUp, Calendar, Clock, Video, BookText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, Info } from "lucide-react";

interface DashboardData {
    stats: {
        totalCourses: number;
        publishedCourses: number;
        totalEnrollments: number;
        totalRevenue: number;
        walletBalance: number;
    };
    activeCourses: Array<{
        id: string;
        title: string;
        enrollmentCount: number;
        price: number;
        type: string;
        createdAt: string;
    }>;
    upcomingClasses: Array<{
        id: string;
        title: string;
        startDate: string;
        schedule: string;
        meetingPlatform: string;
        meetingLink: string;
    }>;
    recentEnrollments: Array<{
        id: string;
        user: { name: string; email: string; avatar: string };
        courseTitle: string;
        enrolledAt: string;
    }>;
    upcomingMentorship?: Array<{
        id: string;
        studentName: string;
        studentAvatar?: string;
        date: string;
        startTime: string;
        duration: number;
        meetingLink: string;
    }>;
}

export function InstructorDashboard({ user }: { user: { name: string; email: string; avatar?: string } }) {
    const { token } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [visibility, setVisibility] = useState({
        revenue: false,
        enrollments: true,
        courses: true,
        avg: true
    });

    useEffect(() => {
        if (token) {
            getInstructorDashboardData(token)
                .then(setData)
                .catch(err => console.error('Failed to fetch instructor dashboard data', err))
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground animate-pulse">Loading your command center...</p>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center py-12 text-destructive">Failed to load dashboard data. Please try again later.</div>;
    }

    const { stats, activeCourses, upcomingClasses, recentEnrollments, upcomingMentorship = [] } = data;

    return (
        <div className="space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-background to-background p-6 rounded-2xl border">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name?.split(' ')[0]}! 👋</h2>
                    <p className="text-muted-foreground mt-1 text-lg">Here&apos;s what&apos;s happening with your courses today.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/instructor/courses">
                        <Button variant="outline" className="hidden sm:flex">Manage Courses</Button>
                    </Link>
                    <Link href="/instructor/create">
                        <Button className="shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow">
                            Create New Course
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-emerald-600"
                                onClick={() => setVisibility(v => ({ ...v, revenue: !v.revenue }))}
                            >
                                {visibility.revenue ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <div className="p-2 bg-emerald-500/10 rounded-full">
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-500">
                            {visibility.revenue ? `₹${stats.totalRevenue.toLocaleString()}` : "₹ ••••••"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Lifetime earnings (70% share)
                        </p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-1">
                            Verified by Adhyayan Shala Platform
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active students
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
                        <div className="p-2 bg-purple-500/10 rounded-full">
                            <BookOpen className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.publishedCourses}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Out of {stats.totalCourses} total
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Enrollment</CardTitle>
                        <div className="p-2 bg-orange-500/10 rounded-full">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {stats.publishedCourses > 0
                                ? Math.round(stats.totalEnrollments / stats.publishedCourses)
                                : 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Per published course
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Areas */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* Left Column (Wider) - Active Courses & Recent Enrollments */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Active Courses */}
                    <Card className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Active Courses</CardTitle>
                                <CardDescription>Your currently published and running courses.</CardDescription>
                            </div>
                            <Link href="/instructor/courses" className="text-sm text-primary hover:underline font-medium">
                                View All
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {activeCourses.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <BookOpen className="mx-auto h-8 w-8 mb-3 opacity-50" />
                                    <p>You haven&apos;t published any courses yet.</p>
                                    <Link href="/instructor/create">
                                        <Button variant="link" className="mt-2">Create Your First Course</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeCourses.slice(0, 4).map((course) => (
                                        <div key={course.id} className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg ${course.type === 'LIVE' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                    {course.type === 'LIVE' ? <Video className="h-5 w-5" /> : <BookText className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" /> {course.enrollmentCount}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="h-3 w-3" /> {visibility.revenue ? `₹${course.price}` : "₹ •••"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/instructor/courses/${course.id}/analytics`}>
                                                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                                                        <TrendingUp className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/instructor/courses/${course.id}/edit`}>Edit Course</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/explore/${course.id}`}>View as Public</Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Enrollments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Enrollments</CardTitle>
                            <CardDescription>New students who joined your courses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentEnrollments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No enrollments yet. Keep marketing your courses!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentEnrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border">
                                                    <AvatarImage src={enrollment.user.avatar || undefined} />
                                                    <AvatarFallback className="bg-primary/5 text-primary">
                                                        {enrollment.user.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium leading-none">{enrollment.user.name}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px] mt-1">
                                                        {enrollment.courseTitle}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(enrollment.enrolledAt), 'MMM d, h:mm a')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column - Upcoming Classes */}
                <div className="space-y-6">
                    <Card className="border-rose-500/20 shadow-md shadow-rose-500/5">
                        <CardHeader className="bg-rose-500/5 pb-4 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                    <Video className="h-5 w-5" />
                                    Upcoming Live Classes
                                </CardTitle>
                            </div>
                            <CardDescription className="pt-2">Your next scheduled sessions.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {upcomingClasses.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Calendar className="mx-auto h-8 w-8 mb-2 opacity-30" />
                                    <p className="text-sm">No upcoming live classes scheduled.</p>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-muted ml-3 space-y-6">
                                    {upcomingClasses.map((cls) => (
                                        <div key={cls.id} className="relative pl-6">
                                            <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background bg-rose-500 ring-4 ring-rose-500/20" />
                                            <div className="flex flex-col gap-1">
                                                <h4 className="font-medium text-sm leading-tight">{cls.title}</h4>
                                                {cls.startDate && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(cls.startDate), 'MMM d, yyyy')}
                                                    </div>
                                                )}
                                                {cls.schedule && (
                                                    <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
                                                        <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                                                        <span>{cls.schedule}</span>
                                                    </div>
                                                )}
                                                {cls.meetingLink && (
                                                    <div className="mt-2">
                                                        <a href={cls.meetingLink} target="_blank" rel="noreferrer">
                                                            <Button size="sm" variant="outline" className="h-7 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20">
                                                                Join {cls.meetingPlatform || 'Meeting'}
                                                            </Button>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Mentorship */}
                    {upcomingMentorship.length > 0 && (
                        <Card className="border-indigo-500/20 shadow-md shadow-indigo-500/5">
                            <CardHeader className="bg-indigo-500/5 pb-4 border-b">
                                <CardTitle className="text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Upcoming Mentorship
                                </CardTitle>
                                <CardDescription className="pt-2">1-on-1 sessions with students.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {upcomingMentorship.map((m) => (
                                        <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={m.studentAvatar} />
                                                    <AvatarFallback>{m.studentName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold">{m.studentName}</p>
                                                    <p className="text-[10px] text-muted-foreground">{format(new Date(m.date), 'MMM d, yyyy')} • {m.startTime}</p>
                                                </div>
                                            </div>
                                            <a href={m.meetingLink} target="_blank" rel="noreferrer">
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                                    Join
                                                </Button>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Tips or Announcements could go here */}
                    <Card className="bg-primary/5 border-none">
                        <CardContent className="p-6">
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-primary" /> Instructor Tip
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Engaging with students through course announcements and discussion boards can significantly boost completion rates and positive reviews.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
