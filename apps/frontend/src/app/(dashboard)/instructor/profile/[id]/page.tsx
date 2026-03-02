"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Star, Users, BookOpen, Calendar, ArrowLeft, Loader2,
    Linkedin, Clock, GraduationCap, ArrowRight, Award, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InstructorProfile {
    id: string;
    name: string;
    avatar?: string;
    memberSince: string;
    profile: {
        bio?: string;
        expertise?: string;
        experience?: string;
        linkedin?: string;
        mentorshipFee: number;
    };
    courses: Array<{
        id: string;
        title: string;
        description?: string;
        level: string;
        type: string;
        price: number;
        discountedPrice?: number | null;
        thumbnailUrl?: string;
        isFree: boolean;
        enrollmentCount: number;
        averageRating: number | null;
        reviewCount: number;
    }>;
    mentorshipSlots: Array<{
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }>;
    stats: {
        totalStudents: number;
        totalCourses: number;
        totalSessions: number;
        averageRating: number;
        totalReviews: number;
    };
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const levelColors: Record<string, string> = {
    BEGINNER: "bg-emerald-100 text-emerald-700",
    INTERMEDIATE: "bg-amber-100 text-amber-700",
    ADVANCED: "bg-rose-100 text-rose-700",
};

export default function InstructorProfilePage() {
    const { token } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token && params.id) {
            fetchProfile();
        }
    }, [token, params.id]);

    const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.get(`/mentorship/instructors/${params.id}/profile`, token!);
            setInstructor(data);
        } catch (err: any) {
            setError(err.message || "Failed to load instructor profile");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary/40 mb-4" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Loading profile...</p>
            </div>
        );
    }

    if (error || !instructor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="p-4 bg-red-50 rounded-full">
                    <Users className="h-12 w-12 text-red-300" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Instructor Not Found</h2>
                <p className="text-muted-foreground">{error || "This instructor profile doesn't exist."}</p>
                <Button variant="outline" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const skills = instructor.profile.expertise?.split(",").map(s => s.trim()).filter(Boolean) || [];

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="gap-2 text-muted-foreground hover:text-primary -ml-2"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {/* === HERO SECTION === */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -ml-12 -mb-12 blur-2xl pointer-events-none" />
                <CardContent className="p-8 md:p-10 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <Avatar className="h-28 w-28 ring-4 ring-white/20 shadow-2xl border-4 border-white/10 flex-shrink-0">
                            <AvatarImage src={instructor.avatar} className="object-cover" />
                            <AvatarFallback className="text-3xl font-bold bg-indigo-600 text-white uppercase">
                                {instructor.name?.[0] || "T"}
                            </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                    {instructor.name}
                                </h1>
                                {instructor.profile.linkedin && (
                                    <a
                                        href={instructor.profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium"
                                    >
                                        <Linkedin className="h-4 w-4" /> LinkedIn
                                    </a>
                                )}
                            </div>

                            {instructor.profile.experience && (
                                <div className="flex items-center gap-2 text-white/70">
                                    <Briefcase className="h-4 w-4" />
                                    <span className="font-medium">{instructor.profile.experience} experience</span>
                                </div>
                            )}

                            <p className="text-white/70 leading-relaxed max-w-2xl text-sm md:text-base">
                                {instructor.profile.bio || "Passionate educator dedicated to sharing knowledge and helping students succeed."}
                            </p>

                            {/* Skills */}
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {skills.map((skill, i) => (
                                        <Badge
                                            key={i}
                                            className="bg-white/10 text-white/90 border-white/20 hover:bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-xs font-semibold"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Member since */}
                            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider pt-2">
                                Member since {new Date(instructor.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* === STATS BAR === */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: "Students", value: instructor.stats.totalStudents, icon: Users, color: "text-indigo-600 bg-indigo-50" },
                    { label: "Courses", value: instructor.stats.totalCourses, icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Sessions", value: instructor.stats.totalSessions, icon: Calendar, color: "text-amber-600 bg-amber-50" },
                    { label: "Rating", value: instructor.stats.averageRating > 0 ? `${instructor.stats.averageRating}★` : "New", icon: Star, color: "text-yellow-600 bg-yellow-50" },
                    { label: "Reviews", value: instructor.stats.totalReviews, icon: Award, color: "text-rose-600 bg-rose-50" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-none shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-5 flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-xl", stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-zinc-900">{stat.value}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* === COURSES SECTION === */}
            {instructor.courses.length > 0 && (
                <div className="space-y-5">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                        <span className="w-1.5 h-7 bg-indigo-500 rounded-full" />
                        Courses by {instructor.name?.split(" ")[0]}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {instructor.courses.map((course) => (
                            <Link href={`/courses/${course.id}`} key={course.id}>
                                <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden cursor-pointer h-full flex flex-col">
                                    {/* Thumbnail */}
                                    <div className="h-36 bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                                        {course.thumbnailUrl ? (
                                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <BookOpen className="h-12 w-12 text-indigo-300" />
                                            </div>
                                        )}
                                        <Badge className={cn("absolute top-3 left-3 text-[10px] font-bold uppercase", levelColors[course.level] || "bg-zinc-100 text-zinc-600")}>
                                            {course.level}
                                        </Badge>
                                        {course.isFree && (
                                            <Badge className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold">
                                                FREE
                                            </Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
                                        <h3 className="font-bold text-zinc-900 group-hover:text-primary transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5" /> {course.enrollmentCount} students
                                            </span>
                                            {course.averageRating && (
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {course.averageRating}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-auto pt-3 border-t border-zinc-100">
                                            {course.isFree ? (
                                                <span className="text-emerald-600 font-bold">Free</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-zinc-900">
                                                        ₹{course.discountedPrice || course.price}
                                                    </span>
                                                    {course.discountedPrice && course.discountedPrice < course.price && (
                                                        <span className="text-sm text-muted-foreground line-through">₹{course.price}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* === MENTORSHIP SECTION === */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="space-y-4 flex-1">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                                <span className="w-1.5 h-7 bg-emerald-500 rounded-full" />
                                1-on-1 Mentorship
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold text-emerald-700">
                                    ₹{Number(instructor.profile.mentorshipFee)}
                                </span>
                                <span className="text-sm text-muted-foreground font-semibold">per session</span>
                            </div>

                            {/* Available slots */}
                            {instructor.mentorshipSlots.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-zinc-700 uppercase tracking-wide">Available Slots</p>
                                    <div className="flex flex-wrap gap-2">
                                        {instructor.mentorshipSlots.map((slot) => (
                                            <Badge
                                                key={slot.id}
                                                variant="outline"
                                                className="bg-white border-emerald-200 text-emerald-800 font-semibold px-3 py-1.5 rounded-lg"
                                            >
                                                <Clock className="h-3 w-3 mr-1.5" />
                                                {DAYS[slot.dayOfWeek]} {slot.startTime} - {slot.endTime}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-amber-600 font-semibold text-sm flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> No slots currently available
                                </p>
                            )}
                        </div>

                        {/* Book button */}
                        <div className="flex-shrink-0">
                            {instructor.mentorshipSlots.length > 0 ? (
                                <Link href={`/mentorship/book/${instructor.id}`}>
                                    <Button className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white rounded-2xl font-bold text-base gap-2 group">
                                        Book a Session
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button disabled className="h-14 px-10 bg-zinc-200 text-zinc-400 rounded-2xl font-bold cursor-not-allowed">
                                    Unavailable
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* === EMPTY COURSES FALLBACK === */}
            {instructor.courses.length === 0 && (
                <Card className="border-2 border-dashed border-zinc-200 shadow-none">
                    <CardContent className="p-12 text-center">
                        <GraduationCap className="h-16 w-16 text-zinc-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-900">No courses published yet</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                            {instructor.name?.split(" ")[0]} hasn&apos;t published any courses yet. Check back soon!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
