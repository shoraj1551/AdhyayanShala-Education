
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Edit, Users, Share2, Video, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DashboardCourse {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    isPublished: boolean;
    type: string;
    startDate?: string | Date;
    _count?: {
        modules?: number;
        tests?: number;
        enrollments?: number;
    };
}

export default function InstructorCoursesPage() {
    const { token } = useAuth();
    const [courses, setCourses] = useState<DashboardCourse[]>([]);
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
                    <p className="mb-4">You haven&apos;t created any courses yet.</p>
                    <Link href="/instructor/create"><Button variant="outline">Create your first course</Button></Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow border-muted flex flex-col group">
                            {/* Thumbnail Section */}
                            <div className="relative aspect-video w-full bg-muted border-b">
                                {course.thumbnailUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5 group-hover:scale-105 transition-transform duration-300">
                                        <Video className="h-10 w-10 opacity-20" />
                                    </div>
                                )}
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                                <div className="absolute top-3 right-3 flex gap-2 z-10">
                                    {course.isPublished ? (
                                        <Badge className="bg-green-500 hover:bg-green-600 border-none text-white shadow-sm flex items-center gap-1.5 px-2 py-0.5 pointer-events-auto">
                                            <CheckCircle2 className="h-3 w-3" /> Published
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-zinc-100/90 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-sm flex items-center gap-1.5 px-2 py-0.5 pointer-events-auto backdrop-blur-sm">
                                            <AlertCircle className="h-3 w-3" /> Draft
                                        </Badge>
                                    )}
                                </div>
                                {course.type === 'LIVE' && (
                                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                                        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 border-none text-white shadow-sm font-semibold tracking-wide pointer-events-auto">
                                            LIVE
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            <CardHeader className="p-5 pb-2">
                                <CardTitle className="line-clamp-1 text-xl leading-tight" title={course.title}>
                                    {course.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="px-5 py-2 space-y-4 flex-grow">
                                {course.type === 'LIVE' && course.startDate && (
                                    <div className="flex items-center gap-2.5 text-sm text-foreground bg-primary/5 border border-primary/10 px-3 py-2.5 rounded-md">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Starts: <span className="font-bold relative">{new Date(course.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
                                    </div>
                                )}

                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] leading-relaxed">
                                    {course.description || "No description provided."}
                                </p>

                                <div className="grid grid-cols-3 gap-2 text-center text-sm border-y py-3.5 bg-muted/10 rounded-lg">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-foreground text-lg">{course._count?.modules || 0}</span>
                                        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Modules</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 border-x border-border/60">
                                        <span className="font-bold text-foreground text-lg">{course._count?.tests || 0}</span>
                                        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Tests</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-foreground text-lg">{course._count?.enrollments || 0}</span>
                                        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Students</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="px-5 py-4 flex flex-col gap-2.5 bg-muted/5 border-t">
                                <div className="flex gap-2 w-full">
                                    <Link href={`/instructor/courses/${course.id}/edit`} className="flex-1">
                                        <Button className="w-full font-semibold shadow-sm" variant="default" size="sm">
                                            <Edit className="mr-2 h-4 w-4" /> Manage
                                        </Button>
                                    </Link>
                                    <Link href={`/instructor/courses/${course.id}/students`} className="flex-1">
                                        <Button className="w-full shadow-sm" variant="outline" size="sm">
                                            <Users className="mr-2 h-4 w-4" /> Students
                                        </Button>
                                    </Link>
                                </div>
                                {course.type === 'LIVE' && (
                                    <Link href={`/instructor/courses/${course.id}/live`} className="w-full">
                                        <Button className="w-full shadow-sm bg-blue-600 hover:bg-blue-700 text-white" variant="default" size="sm">
                                            <Video className="mr-2 h-4 w-4" /> Enter Live Classroom
                                        </Button>
                                    </Link>
                                )}
                                <Button
                                    className="w-full hover:bg-muted/50 transition-colors"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const url = `${window.location.origin}/courses/${course.id}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success("Course link copied to clipboard!");
                                    }}
                                >
                                    <Share2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground font-medium">Copy Share Link</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
