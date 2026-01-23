"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import { PlayCircle, FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Lesson {
    id: string;
    title: string;
    type: 'VIDEO' | 'TEXT';
    duration: number;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface CourseContent {
    id: string;
    title: string;
    modules: Module[];
    tests: any[];
}

export default function CoursePlayerPage() {
    const params = useParams();
    const { token } = useAuth();
    const [course, setCourse] = useState<CourseContent | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentLoading, setEnrollmentLoading] = useState(true);
    const { user } = useAuth(); // Need user role

    useEffect(() => {
        if (token && params.id) {
            // Fetch Course
            api.get(`/courses/${params.id}`, token)
                .then(data => {
                    setCourse(data);
                    if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
                        setSelectedLesson(data.modules[0].lessons[0]);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));

            // Fetch Enrollment Status
            api.get(`/courses/${params.id}/status`, token)
                .then(data => setIsEnrolled(data.isEnrolled))
                .catch(err => {
                    console.error("Enrollment check failed", err);
                    // If error (e.g. 401), assume false
                    setIsEnrolled(false);
                })
                .finally(() => setEnrollmentLoading(false));
        }
    }, [token, params.id]);

    const handleEnroll = async () => {
        if (!token) return;
        try {
            await api.post(`/courses/${params.id}/enroll`, {}, token);
            setIsEnrolled(true);
            alert("Enrolled successfully!");
        } catch (error) {
            alert("Failed to enroll.");
        }
    }

    if (loading || enrollmentLoading) return <div className="p-8">Loading course content...</div>;
    if (!course) return <div className="p-8">Course not found.</div>;

    // Admin/Instructor bypass
    const canAccess = isEnrolled || user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

    if (!canAccess) {
        return (
            <div className="container mx-auto p-12 max-w-4xl text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold">{course.title}</h1>
                    <p className="text-xl text-muted-foreground">{course.modules.length} Modules • {course.tests.length} Assessments</p>
                </div>

                <Card className="p-8 bg-muted/20 border-2 border-primary/20">
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold mb-4">Join this course today</p>
                            <Button size="lg" className="w-full md:w-1/2 text-lg h-14" onClick={handleEnroll}>
                                Enroll Now
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Get full access to all video lessons, reading materials, and quizzes.
                        </p>
                    </CardContent>
                </Card>

                <div className="text-left max-w-2xl mx-auto">
                    <h3 className="font-bold text-lg mb-2">What you'll learn:</h3>
                    <ul className="grid grid-cols-1 gap-2">
                        {course.modules.map((m, i) => (
                            <li key={m.id} className="flex items-center gap-2 p-3 bg-card border rounded">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                {m.title}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
            {/* Sidebar / Modules List */}
            <div className="w-full md:w-80 border-r bg-muted/10 overflow-y-auto">
                <div className="p-4 font-bold text-lg border-b bg-background">
                    {course.title}
                </div>
                {course.modules.map((module, i) => (
                    <div key={module.id} className="mb-2">
                        <div className="px-4 py-2 text-sm font-semibold text-muted-foreground bg-muted/30">
                            Module {i + 1}: {module.title}
                        </div>
                        <div>
                            {module.lessons.map(lesson => (
                                <button
                                    key={lesson.id}
                                    onClick={() => setSelectedLesson(lesson)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent text-left",
                                        selectedLesson?.id === lesson.id ? "bg-accent text-accent-foreground border-r-2 border-primary" : ""
                                    )}
                                >
                                    {lesson.type === 'VIDEO' ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                    <span className="line-clamp-1">{lesson.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Tests Section */}
                {course.tests && course.tests.length > 0 && (
                    <div className="mb-2">
                        <div className="px-4 py-2 text-sm font-semibold text-muted-foreground bg-muted/30 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Assessments
                        </div>
                        <div>
                            {course.tests.map(test => (
                                <Link
                                    key={test.id}
                                    href={`/tests/${test.id}`}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent text-left pl-6"
                                >
                                    <span className="line-clamp-1">{test.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-background p-6 md:p-10">
                {selectedLesson ? (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="pb-4 border-b">
                            <h1 className="text-3xl font-bold">{selectedLesson.title}</h1>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            {/* In a real app, this would be a Video Player component or Markdown Renderer */}
                            <div className="p-8 border rounded-lg bg-card text-center min-h-[400px] flex flex-col items-center justify-center space-y-4">
                                {selectedLesson.type === 'VIDEO' ? (
                                    <>
                                        <PlayCircle className="h-16 w-16 text-muted-foreground" />
                                        <p className="text-muted-foreground">Video Player Placeholder for: {selectedLesson.title}</p>
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-16 w-16 text-muted-foreground" />
                                        <p className="text-muted-foreground">Text Content Placeholder for: {selectedLesson.title}</p>
                                    </>
                                )}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Button>
                                    Mark as Complete <CheckCircle className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a lesson to start learning
                    </div>
                )}
            </div>
        </div>
    );
}
