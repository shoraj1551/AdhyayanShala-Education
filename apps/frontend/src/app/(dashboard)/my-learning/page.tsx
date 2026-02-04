"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, BookOpen, Clock, Trophy, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/CourseCard";

interface EnrolledCourse {
    id: string;
    title: string;
    description: string;
    instructor: {
        id: string;
        name: string;
        email: string;
    };
    enrolledAt: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    type: string;
}

export default function MyLearningPage() {
    const { token } = useAuth();
    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.get('/student/enrolled-courses', token)
                .then(setCourses)
                .catch((err) => {
                    console.error('Error fetching enrolled courses:', err);
                    setCourses([]);
                })
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Learning</h2>
                    <p className="text-muted-foreground">
                        Continue your learning journey
                    </p>
                </div>
                <Link href="/courses">
                    <Button variant="outline">Browse More Courses</Button>
                </Link>
            </div>

            {courses.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Enrolled Courses</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            You haven't enrolled in any courses yet. Start learning today!
                        </p>
                        <Link href="/courses">
                            <Button>Browse Courses</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-12">
                    {/* In Progress Section */}
                    {courses.filter(c => c.progress < 100).length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-primary" />
                                In Progress
                            </h3>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {courses.filter(c => c.progress < 100).map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Section */}
                    {courses.filter(c => c.progress === 100).length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-green-600">
                                <Trophy className="h-6 w-6" />
                                Completed
                            </h3>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {courses.filter(c => c.progress === 100).map((course) => (
                                    <CourseCard key={course.id} course={course} isCompleted />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {courses.length > 0 && (
                <Card className="bg-gradient-to-br from-primary/5 to-primary/0 border-l-4 border-l-primary">
                    <CardHeader>
                        <CardTitle>Keep Learning!</CardTitle>
                        <CardDescription>
                            You're making great progress. Complete your courses to unlock certificates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-full">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{courses.length}</p>
                                    <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-full">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {courses.reduce((sum, c) => sum + c.completedLessons, 0)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Lessons Completed</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-full">
                                    <Trophy className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {courses.filter(c => c.progress === 100).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
