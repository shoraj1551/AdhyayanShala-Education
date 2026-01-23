"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
            router.refresh();
        } catch (error) {
            console.error("Enrollment failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                        {course.level}
                    </span>
                </div>
                <CardDescription className="line-clamp-2">
                    {course.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course._count?.modules || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Self-paced</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
                {isEnrolled ? (
                    <Link href={`/courses/${course.id}`} className="w-full">
                        <Button className="w-full" variant="secondary">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Continue Learning
                        </Button>
                    </Link>
                ) : (
                    <Button className="w-full" onClick={handleEnroll} disabled={loading}>
                        {loading ? "Enrolling..." : (course.price > 0 ? `Enroll ($${course.price})` : "Enroll for Free")}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
