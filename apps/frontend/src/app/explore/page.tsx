"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BookOpen, FileText, Calendar, Clock, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Inline simple Badge component
const Badge = ({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "secondary" | "outline" }) => {
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
    };
    return (
        <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
            {children}
        </div>
    );
};

export default function ExplorePage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("courses"); // "courses" | "tests"

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Courses and Tests concurrently
                const [coursesData, testsData] = await Promise.all([
                    api.get('/courses').catch(() => []),
                    api.get('/tests').catch(() => [])
                ]);
                setCourses(coursesData);
                setTests(testsData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Data fetching works, but we are removing hardcoded "Upcoming" sections as per user request.
    // If we want to show upcoming items, we should filter the real data (courses/tests) once the API supports 'startDate' or similar fields.

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-primary/5 py-12 border-b">
                <div className="container px-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2 md:static md:translate-y-0"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div className="w-full text-center">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Explore AdhyayanShala</h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Discover top-rated courses and practice tests to accelerate your career.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 mt-12">

                {/* Custom Tabs Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="grid w-full max-w-md grid-cols-2 p-1 bg-muted rounded-xl">
                        <button
                            onClick={() => setActiveTab("courses")}
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                activeTab === "courses" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                            )}
                        >
                            Courses
                        </button>
                        <button
                            onClick={() => setActiveTab("tests")}
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                activeTab === "tests" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                            )}
                        >
                            Tests & Assessments
                        </button>
                    </div>
                </div>

                {/* COURSES TAB */}
                {activeTab === "courses" && (
                    <div className="space-y-12">
                        {/* Current Courses */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <BookOpen className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-bold">Current Courses</h2>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}
                                </div>
                            ) : courses.length > 0 ? (
                                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {courses.map((course: any) => (
                                        <motion.div key={course.id} variants={item}>
                                            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow border-primary/20">
                                                <CardHeader>
                                                    <div className="flex justify-between items-start">
                                                        <Badge variant="outline" className="bg-primary/5">{course.level}</Badge>
                                                        <Badge variant="secondary">₹{course.price}</Badge>
                                                    </div>
                                                    <CardTitle className="mt-2 line-clamp-2">{course.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1">
                                                    <p className="text-muted-foreground text-sm line-clamp-3">{course.description}</p>
                                                </CardContent>
                                                <CardFooter>
                                                    <Link href={`/courses/${course.id}`} className="w-full">
                                                        <Button className="w-full">View Details</Button>
                                                    </Link>
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="text-center py-12 border rounded-xl bg-muted/20">
                                    <p className="text-muted-foreground">No active courses found. Check back soon!</p>
                                </div>
                            )}
                        </div>

                        {/* Upcoming Courses Section Removed as per request to delete dummy data */}
                    </div>
                )}

                {/* TESTS TAB */}
                {activeTab === "tests" && (
                    <div className="space-y-12">
                        {/* Open Tests */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <FileText className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-bold">Open Tests</h2>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
                                </div>
                            ) : tests.length > 0 ? (
                                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {tests.map((test: any) => (
                                        <motion.div key={test.id} variants={item}>
                                            <Card className="h-full hover:border-primary transition-colors">
                                                <CardHeader>
                                                    <CardTitle>{test.title}</CardTitle>
                                                    <CardDescription>{test.description || "No description provided."}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-2 rounded">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{test.duration ? `${test.duration} mins` : 'Untimed'}</span>
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Link href={`/login?redirect=/tests/${test.id}`} className="w-full">
                                                        <Button className="w-full" variant="secondary">Take Test</Button>
                                                    </Link>
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="text-center py-12 border rounded-xl bg-muted/20">
                                    <p className="text-muted-foreground">No open tests available right now.</p>
                                </div>
                            )}
                        </div>

                        {/* Upcoming Tests Section Removed as per request to delete dummy data */}
                    </div>
                )}
            </div>
        </div>
    );
}
