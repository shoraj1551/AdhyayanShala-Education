"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

interface CourseCardProps {
    course: {
        id: string;
        title: string;
        description: string;
        level: string;
        price: number;
        _count?: {
            modules: number;
        }
    };
}

export function CourseCard({ course }: CourseCardProps) {
    const router = useRouter();
    const { token } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check enrollment status (optimistic or separate call)
        // To minimize API calls, we might want to pass this prop from parent, 
        // but for now let's just make it work.
        if (token) {
            api.get(`/courses/${course.id}/status`, token)
                .then(res => setIsEnrolled(res.isEnrolled))
                .catch(() => setIsEnrolled(false));
        }
    }, [course.id, token]);


    const handleEnroll = async () => {
        if (!token) {
            router.push('/login');
            return;
        }
        setLoading(true);
        try {
            await api.post(`/courses/${course.id}/enroll`, {}, token);
            setIsEnrolled(true);
            toast.success("Enrolled successfully! Redirecting...");
            router.refresh();
            // Optional: Redirect to course immediately
            // router.push(`/courses/${course.id}`);
        } catch (error: any) {
            console.error("Enrollment failed", error);
            if (error.status === 403 || error.message?.includes("limit")) {
                toast.error("Guest Limit Reached", {
                    description: "You can only enroll in 2 courses as a guest. Please create an account to unlock unlimited access.",
                    duration: 5000,
                    action: {
                        label: "Register",
                        onClick: () => router.push("/register")
                    }
                });
            } else {
                toast.error("Enrollment failed", {
                    description: error.message || "Something went wrong. Please try again."
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (

        <Card className="flex flex-col h-full group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2 text-xl font-bold group-hover:text-primary transition-colors">{course.title}</CardTitle>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm bg-primary/10 text-primary border-primary/20">
                        {course.level}
                    </span>
                </div>
                <CardDescription className="line-clamp-2 pt-2">
                    {course.description || "Unlock your potential with this comprehensive course designed for master learners."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-4">
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
                        <BookOpen className="h-4 w-4" />
                        <span>{course._count?.modules || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
                        <Clock className="h-4 w-4" />
                        <span>Self-paced</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-muted/20">
                {isEnrolled ? (
                    <Link href={`/courses/${course.id}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 border-none">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Continue Learning
                        </Button>
                    </Link>
                ) : (
                    <Button
                        className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all text-white font-semibold"
                        onClick={handleEnroll}
                        disabled={loading}
                    >
                        {loading ? "Enrolling..." : (course.price > 0 ? `Enroll ($${course.price})` : "Enroll for Free")}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
