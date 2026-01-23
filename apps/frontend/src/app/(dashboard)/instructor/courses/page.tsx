
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";

export default function InstructorCoursesPage() {
    const { token } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.get('/courses/instructor', token)
                .then(setCourses)
                .catch(err => console.error("Failed to fetch instructor courses", err))
                .finally(() => setLoading(false));
        }
    }, [token]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Courses</h1>
                <Link href="/instructor/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Course
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div>Loading courses...</div>
            ) : courses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                    <p className="mb-4">You haven't created any courses yet.</p>
                    <Link href="/instructor/create"><Button variant="outline">Create your first course</Button></Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card key={course.id}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                    <span className="line-clamp-1">{course.title}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {course.description || "No description provided."}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex flex-col">
                                        <span className="font-bold">{course._count?.modules || 0}</span>
                                        <span>Modules</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{course._count?.tests || 0}</span>
                                        <span>Tests</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{course._count?.enrollments || 0}</span>
                                        <span>Students</span>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Link href={`/instructor/courses/${course.id}/edit`}>
                                        <Button className="w-full" variant="secondary">
                                            <Edit className="mr-2 h-4 w-4" /> Manage Content
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
