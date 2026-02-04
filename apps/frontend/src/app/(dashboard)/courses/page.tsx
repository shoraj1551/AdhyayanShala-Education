"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, TrendingUp, DollarSign, Users, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
    price: number;
    discountedPrice?: number;
    type: string;
    isPublished: boolean;
    createdAt: string;
    isEnrolled?: boolean;
    progress?: number;
    isCompleted?: boolean;
    instructor?: {
        id: string;
        name: string;
        email: string;
    };
    _count?: {
        modules: number;
        enrollments: number;
    };
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [instructorFilter, setInstructorFilter] = useState<string>("all");
    const [enrollmentFilter, setEnrollmentFilter] = useState<"all" | "enrolled" | "not-enrolled">("all");
    const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([]);
    const { token, user } = useAuth();

    const isInstructor = user?.role === 'INSTRUCTOR';

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                let url = '/courses';
                const params = new URLSearchParams();

                if (searchQuery.trim()) {
                    params.append('search', searchQuery.trim());
                }

                // For instructors: exclude their own courses (market research)
                if (isInstructor && user?.id) {
                    params.append('excludeInstructor', user.id);
                }

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }

                console.log('Fetching courses from:', url);

                const [coursesData, enrolledData] = await Promise.all([
                    api.get(url, token ?? undefined),
                    token && !isInstructor ? api.get('/student/enrolled-courses', token).catch(() => []) : Promise.resolve([])
                ]);

                const enrolledMap = new Map(enrolledData.map((e: any) => [e.id, e]));

                const mergedCourses = coursesData.map((c: Course) => {
                    const enrolled = enrolledMap.get(c.id) as any;
                    return {
                        ...c,
                        isEnrolled: !!enrolled,
                        progress: enrolled?.progress || 0,
                        isCompleted: enrolled?.progress === 100
                    };
                });

                // Sorting Logic: Not Enrolled -> In Progress -> Completed
                mergedCourses.sort((a: any, b: any) => {
                    const getWeight = (c: any) => {
                        if (!c.isEnrolled) return 0;
                        if (c.progress < 100) return 1;
                        return 2;
                    };

                    const weightA = getWeight(a);
                    const weightB = getWeight(b);

                    if (weightA !== weightB) return weightA - weightB;

                    return 0; // Maintain original server sort (usually recency) within groups
                });

                setCourses(mergedCourses);

                // Extract unique instructors
                const uniqueInstructors = Array.from(
                    new Map(
                        coursesData
                            .filter((c: Course) => c.instructor)
                            .map((c: Course) => [c.instructor!.id, { id: c.instructor!.id, name: c.instructor!.name }])
                    ).values()
                ) as Array<{ id: string; name: string }>;
                setInstructors(uniqueInstructors);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchCourses, 300);
        return () => clearTimeout(timer);
    }, [token, searchQuery, isInstructor, user?.id]);

    // Filter courses by instructor and enrollment status
    let filteredCourses = instructorFilter === "all"
        ? courses
        : courses.filter(c => c.instructor?.id === instructorFilter);

    // Filter by enrollment status (dropdown override)
    if (enrollmentFilter === "enrolled") {
        filteredCourses = filteredCourses.filter(c => c.isEnrolled);
    } else if (enrollmentFilter === "not-enrolled") {
        filteredCourses = filteredCourses.filter(c => !c.isEnrolled);
    }

    // Separate courses by type and recency
    const liveCourses = filteredCourses.filter(c => c.type === 'LIVE');

    // For "Recent", we explicitly sort by date regardless of enrollment
    const recentCourses = [...filteredCourses]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isInstructor ? "Market Research" : "Browse Courses"}
                    </h2>
                    <p className="text-muted-foreground">
                        {isInstructor
                            ? "Analyze market trends and competitor courses to plan your next bestseller."
                            : "Explore our catalog of courses to enhance your skills."}
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={isInstructor ? "Search competitors..." : "Search courses..."}
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {!isInstructor && instructors.length > 0 && (
                        <Select value={instructorFilter} onValueChange={setInstructorFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Instructors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Instructors</SelectItem>
                                {instructors.map(instructor => (
                                    <SelectItem key={instructor.id} value={instructor.id}>
                                        {instructor.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Student-only sections */}
            {!isInstructor && (
                <>
                    {/* Recently Published Courses */}
                    {recentCourses.length > 0 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">Recently Published</h3>
                                <p className="text-muted-foreground">Fresh content from our instructors</p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {recentCourses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Live Classes */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight">Upcoming Live Classes</h3>
                            <p className="text-muted-foreground">Join real-time sessions with industry experts</p>
                        </div>
                        {liveCourses.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground text-center">
                                        No upcoming live classes at the moment.<br />
                                        Check back soon for new sessions!
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {liveCourses.map((course) => (
                                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
                                        <CardContent className="flex gap-4 p-4">
                                            <div className="w-16 h-16 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                                <Clock className="h-8 w-8 text-blue-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold truncate">{course.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    with {course.instructor?.name || 'Instructor'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                                                        Live
                                                    </span>
                                                    <span className="text-xs font-semibold">
                                                        ₹{(course.discountedPrice || course.price).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" className="self-center">
                                                View
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* All Courses Section */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">
                        {isInstructor ? "Competitor Analysis" : "All Courses"}
                    </h3>
                    <p className="text-muted-foreground">
                        {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
                    </p>
                </div>
            </div>

            {/* Course Grid (Catalog) */}

            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[300px] rounded-lg bg-muted/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            {searchQuery || instructorFilter !== "all"
                                ? "No courses found matching your filters."
                                : "No courses available yet."}
                        </div>
                    )}
                </div>
            )}

            {/* Newsletter / Waitlist - Student Only */}
            {!isInstructor && (
                <div className="mt-8 rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 md:p-8 text-center relative overflow-hidden border border-white/10">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Stay Ahead of the Curve</h2>
                    <p className="text-indigo-200 max-w-xl mx-auto mb-6 text-sm">
                        Get weekly updates on new courses, live class schedules, and exclusive learning resources delivered to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <Input placeholder="Enter your email" className="bg-white/5 border-white/10 text-white placeholder:text-white/40" />
                        <Button className="bg-white text-indigo-950 hover:bg-white/90 font-bold">Join Waitlist</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
