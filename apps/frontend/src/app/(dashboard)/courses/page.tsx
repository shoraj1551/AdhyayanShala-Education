"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, TrendingUp, DollarSign, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    const { token, user } = useAuth();

    const isInstructor = user?.role === 'INSTRUCTOR';

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
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isInstructor ? "Market Research" : "Browse Courses"}
                    </h2>
                    <p className="text-muted-foreground">
                        {isInstructor
                            ? "Analyze market trends and competitor courses to plan your next bestseller."
                            : "Explore our catalog of courses to enhance your skills."}
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={isInstructor ? "Search competitors..." : "Search courses..."}
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Instructor Market Insights Section */}
            {isInstructor && (
                <div className="grid gap-4 md:grid-cols-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="bg-emerald-500/10 border-emerald-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-500">Trending Topic</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">System Design</div>
                            <p className="text-xs text-emerald-400/80">+20% search volume this week</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-500">Avg. Course Price</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">$49.99</div>
                            <p className="text-xs text-blue-400/80">For intermediate tech courses</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-500">Student Demand</CardTitle>
                            <Users className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">High</div>
                            <p className="text-xs text-purple-400/80">Specifically for DevOps & AI</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Course Grid (Catalog) */}
            {/* If instructor, we frame this as "Competitor Courses" */}
            {isInstructor && <h3 className="text-xl font-semibold mb-4 text-zinc-300">Competitor Analysis</h3>}

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

            {/* Live Classes Section - Student Only */}
            {!isInstructor && (
                <div className="mt-16">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Upcoming Live Classes</h2>
                            <p className="text-muted-foreground">Join real-time sessions with industry experts.</p>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {[
                            { title: "System Design Masterclass", date: "Tomorrow, 8:00 PM", instructor: "Dr. Sarah Chen", image: "bg-blue-500/10" },
                            { title: "Advanced React Patterns", date: "Sat, 2:00 PM", instructor: "Mike Johnson", image: "bg-purple-500/10" }
                        ].map((cls, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
                                <div className={`w-24 h-24 rounded-lg ${cls.image} flex items-center justify-center`}>
                                    <div className="p-2 bg-background/50 rounded-full backdrop-blur-sm">
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center flex-1">
                                    <h3 className="font-bold group-hover:text-primary transition-colors">{cls.title}</h3>
                                    <p className="text-sm text-muted-foreground">with {cls.instructor}</p>
                                    <div className="mt-3 flex items-center gap-4 text-xs font-medium">
                                        <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 border border-green-500/20">Live</span>
                                        <span className="text-muted-foreground">{cls.date}</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="self-center">Join</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Newsletter / Waitlist - Student Only */}
            {!isInstructor && (
                <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-8 md:p-12 text-center relative overflow-hidden border border-white/10">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Stay Ahead of the Curve</h2>
                    <p className="text-indigo-200 max-w-xl mx-auto mb-8">
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
