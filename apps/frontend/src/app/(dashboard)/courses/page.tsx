"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, TrendingUp, Users, Filter, ArrowLeft, Library } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { WaitlistForm } from "@/components/waitlist-form";

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
    const [instructors, setInstructors] = useState<Array<{ name: string }>>([]);
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

                if (isInstructor && user?.id) {
                    params.append('excludeInstructor', user.id);
                }

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }

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

                mergedCourses.sort((a: any, b: any) => {
                    const getWeight = (c: any) => {
                        if (!c.isEnrolled) return 0;
                        if (c.progress < 100) return 1;
                        return 2;
                    };
                    const weightA = getWeight(a);
                    const weightB = getWeight(b);
                    if (weightA !== weightB) return weightA - weightB;
                    return 0;
                });

                setCourses(mergedCourses);

                const uniqueInstructors = Array.from(
                    new Map(
                        coursesData
                            .filter((c: Course) => c.instructor)
                            .map((c: Course) => [c.instructor!.name, { name: c.instructor!.name }])
                    ).values()
                ) as Array<{ name: string }>;
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

    let filteredCourses = instructorFilter === "all"
        ? courses
        : courses.filter(c => c.instructor?.name === instructorFilter);

    if (enrollmentFilter === "enrolled") {
        filteredCourses = filteredCourses.filter(c => c.isEnrolled);
    } else if (enrollmentFilter === "not-enrolled") {
        filteredCourses = filteredCourses.filter(c => !c.isEnrolled);
    }

    const liveCourses = filteredCourses.filter(c => c.type === 'LIVE');
    const recentCourses = [...filteredCourses]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full hover:bg-zinc-100">
                        <ArrowLeft className="h-6 w-6 text-zinc-600" />
                    </Button>
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {isInstructor ? "Market Research" : "Browse Courses"}
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            {isInstructor
                                ? "Analyze market trends and discover what students are learning."
                                : "Explore our catalog of world-class courses."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Instructor Metrics Row */}
            {isInstructor && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-indigo-50/50 border-indigo-100 shadow-sm border-none backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                                    <Library className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Total Active</p>
                                    <h4 className="text-2xl font-black text-indigo-950">{courses.length}+</h4>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-50/50 border-purple-100 shadow-sm border-none backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Market Demand</p>
                                    <h4 className="text-2xl font-black text-purple-950">High</h4>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm border-none backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Users</p>
                                    <h4 className="text-2xl font-black text-emerald-950">2.4k+</h4>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50/50 border-amber-100 shadow-sm border-none backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Avg Completion</p>
                                    <h4 className="text-2xl font-black text-amber-950">68%</h4>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search and Filters Row */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={isInstructor ? "Search competitors and keywords..." : "What do you want to learn today?"}
                        className="pl-10 h-12 bg-white border-zinc-200 focus-visible:ring-indigo-500 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {!isInstructor && instructors.length > 0 && (
                    <Select value={instructorFilter} onValueChange={setInstructorFilter}>
                        <SelectTrigger className="w-full md:w-[200px] h-12 rounded-xl border-zinc-200">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Instructors" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Instructors</SelectItem>
                            {instructors.map(instructor => (
                                <SelectItem key={instructor.name} value={instructor.name}>
                                    {instructor.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Student-only sections */}
            {!isInstructor && (
                <>
                    {recentCourses.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold tracking-tight">Recently Published</h3>
                                <Button variant="link" className="text-indigo-600">See all</Button>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {recentCourses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold tracking-tight">Upcoming Live Classes</h3>
                        {liveCourses.length === 0 ? (
                            <Card className="border-dashed border-2 bg-zinc-50/50">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground text-center font-medium">
                                        No upcoming live classes at the moment.<br />
                                        Check back soon for new sessions!
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {liveCourses.map((course) => (
                                    <Card key={course.id} className="hover:shadow-lg transition-all border-none bg-white shadow-sm ring-1 ring-zinc-100 overflow-hidden group">
                                        <CardContent className="flex gap-4 p-4">
                                            <div className="w-20 h-20 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                                                <Clock className="h-10 w-10 text-indigo-500" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="font-bold text-lg truncate text-zinc-900">{course.title}</h4>
                                                <p className="text-sm text-muted-foreground font-medium">
                                                    with {course.instructor?.name || 'Instructor'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-bold uppercase tracking-wider">
                                                        Live
                                                    </span>
                                                    <span className="text-sm font-bold text-zinc-900">
                                                        ₹{(course.discountedPrice || course.price).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" className="self-center rounded-lg border-zinc-200 font-bold px-4 hover:bg-zinc-50">
                                                Join
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Catalog Section */}
            <div className="space-y-6 pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
                            {isInstructor ? "Competitor Analysis" : "Explore Library"}
                        </h3>
                        <p className="text-muted-foreground font-medium">
                            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[320px] rounded-2xl bg-zinc-100 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                                <div className="inline-flex p-4 bg-zinc-100 rounded-full mb-4">
                                    <Search className="h-8 w-8 text-zinc-400" />
                                </div>
                                <p className="text-zinc-500 font-bold text-xl mb-1">No courses found</p>
                                <p className="text-zinc-400">Try adjusting your filters or search keywords.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Newsletter - Student Only */}
            {!isInstructor && (
                <div className="mt-12 rounded-[2rem] bg-indigo-950 p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-indigo-400 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-purple-400 rounded-full blur-[100px]" />
                    </div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Stay Ahead of the Curve</h2>
                        <p className="text-indigo-200/80 max-w-xl mx-auto mb-10 text-lg font-medium">
                            Get weekly updates on new courses, live class schedules, and exclusive learning resources delivered to your inbox.
                        </p>
                        <div className="flex justify-center scale-110 md:scale-125 origin-center">
                            <WaitlistForm />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
