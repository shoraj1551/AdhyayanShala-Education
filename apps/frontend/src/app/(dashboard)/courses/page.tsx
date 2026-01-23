"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
    price: number;
    isPublished: boolean;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            const fetchCourses = async () => {
                setLoading(true);
                try {
                    const searchParam = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
                    const data = await api.get(`/courses${searchParam}`, token);
                    setCourses(data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            const timer = setTimeout(fetchCourses, 500);
            return () => clearTimeout(timer);
        }
    }, [token, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Browse Courses</h2>
                    <p className="text-muted-foreground">
                        Explore our catalog of courses to enhance your skills.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search courses..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[300px] rounded-lg bg-muted/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No courses found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
