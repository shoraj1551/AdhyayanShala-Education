"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Search, Loader2, MoreHorizontal, Shield, BookOpen, EyeOff, Trash2, Globe } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";

interface CourseData {
    id: string;
    title: string;
    description: string;
    instructor: { name: string; email: string };
    isPublished: boolean;
    createdAt: string;
    _count: {
        enrollments: number;
        lessons: number;
    };
    price: number;
}

export default function AdminCoursePage() {
    const { token } = useAuth();
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                status: statusFilter,
                search: searchQuery
            });
            const data = await api.get(`/admin/courses?${query}`, token ?? undefined);
            setCourses(data.courses);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        const timer = setTimeout(() => {
            fetchCourses();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, statusFilter, searchQuery, token]);

    const handleToggleStatus = async (courseId: string, currentStatus: boolean) => {
        if (!token) return;
        try {
            await api.patch(`/admin/courses/${courseId}/status`, { isPublished: !currentStatus }, token);
            toast.success(currentStatus ? "Course unpublished" : "Course published");
            fetchCourses();
        } catch (error: any) {
            toast.error(error.message || error.data?.message || "Failed to update status");
        }
    };

    const handleDelete = async (courseId: string) => {
        if (!token) return;
        if (!confirm("Are you sure? This action is irreversible.")) return;
        try {
            await api.delete(`/admin/courses/${courseId}`, token);
            toast.success("Course deleted");
            fetchCourses();
        } catch (error: any) {
            toast.error(error.message || error.data?.message || "Failed to delete course");
        }
    };

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
                    <p className="text-muted-foreground">Review, unpublish, or delete courses on the platform.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses by title..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                <SelectItem value="DRAFT">Draft/Unpublished</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Instructor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Stats</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading content...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : courses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No courses found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    courses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell className="max-w-[300px]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium truncate" title={course.title}>{course.title}</span>
                                                    <span className="text-xs text-muted-foreground truncate">{course.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{course.instructor?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">{course.instructor?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {course.isPublished ? (
                                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1">
                                                        <Globe className="h-3 w-3" /> Published
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <EyeOff className="h-3 w-3" /> Draft
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {course._count.enrollments} Students
                                                <br />
                                                {course._count.lessons} Lessons
                                            </TableCell>
                                            <TableCell>₹{course.price}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Moderation</DropdownMenuLabel>
                                                        <Link href={`/courses/${course.id}`} target="_blank">
                                                            <DropdownMenuItem>
                                                                <BookOpen className="mr-2 h-4 w-4" /> View as Student
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        <Link href={`/instructor/courses/${course.id}/edit`}>
                                                            <DropdownMenuItem>
                                                                <MoreHorizontal className="mr-2 h-4 w-4" /> Edit Content
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(course.id, course.isPublished)}>
                                                            {course.isPublished ? (
                                                                <>
                                                                    <EyeOff className="mr-2 h-4 w-4 text-orange-600" />
                                                                    <span className="text-orange-600">Unpublish</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Globe className="mr-2 h-4 w-4 text-green-600" />
                                                                    <span className="text-green-600">Publish</span>
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(course.id)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
