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
import { BookOpen, Clock, CheckCircle, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { EnrollmentModal } from "@/components/EnrollmentModal";

interface CourseCardProps {
    course: {
        id: string;
        title: string;
        description: string;
        level: string;
        price: number;
        discountedPrice?: number;
        type?: string;
        isEnrolled?: boolean;
        isCompleted?: boolean;
        _count?: {
            modules: number;
            enrollments?: number;
        };
        instructor?: {
            id: string;
            name: string;
            email: string;
        };
    };
}

export function CourseCard({ course }: CourseCardProps) {
    const router = useRouter();
    const { token } = useAuth();
    // Use prop as initial state, but allow local override after successful enrollment
    const [isEnrolled, setIsEnrolled] = useState(course.isEnrolled || false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setIsEnrolled(course.isEnrolled || false);
    }, [course.isEnrolled]);

    const handleEnrollClick = () => {
        if (!token) {
            router.push('/login');
            return;
        }
        setIsModalOpen(true);
    };

    return (

        <Card className="flex flex-col h-full group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <Link href={`/courses/${course.id}`} className="block cursor-pointer">
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
            </Link>
            <CardContent className="flex-1">
                {/* Instructor Info */}
                {course.instructor && (
                    <div className="mb-3 pb-3 border-b">
                        <p className="text-sm text-muted-foreground">
                            Instructor: <span className="font-medium text-foreground">{course.instructor.name}</span>
                        </p>
                    </div>
                )}

                <div className="flex items-center text-sm font-medium text-muted-foreground gap-4">
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
                        <BookOpen className="h-4 w-4" />
                        <span>{course._count?.modules || 0} Modules</span>
                    </div>
                    {course.type && (
                        <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
                            <span className="text-xs">{course.type === 'LIVE' ? '🔴 Live' : '📹 Video'}</span>
                        </div>
                    )}
                    {course._count?.enrollments !== undefined && (
                        <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
                            <span>{course._count.enrollments} students</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-muted/20">
                {isEnrolled ? (
                    <Link href={`/courses/${course.id}`} className="w-full">
                        <Button
                            className={`w-full text-white shadow-lg border-none ${course.isCompleted
                                ? "bg-muted hover:bg-muted/80 text-foreground shadow-none border border-input"
                                : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/20"
                                }`}
                            variant={course.isCompleted ? "outline" : "default"}
                        >
                            {course.isCompleted ? (
                                <>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Review Course
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Continue Learning
                                </>
                            )}
                        </Button>
                    </Link>
                ) : (
                    <div className="flex gap-2 w-full">
                        <Link href={`/courses/${course.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                                View Details
                            </Button>
                        </Link>
                        <Button
                            className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all text-white font-semibold"
                            onClick={handleEnrollClick}
                        >
                            Enroll
                        </Button>
                    </div>
                )}
            </CardFooter>

            <EnrollmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsEnrolled(true);
                    router.refresh();
                }}
                course={course}
            />
        </Card>
    );
}
