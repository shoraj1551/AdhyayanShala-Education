"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Calendar, Star, GraduationCap, ArrowRight, UserCheck, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Instructor {
    id: string;
    name: string;
    avatar?: string;
    expertise?: string;
    bio?: string;
    mentorshipFee: number;
    mentorshipSlots: any[];
}

export default function MentorshipPage() {
    const { token, user } = useAuth();
    const [search, setSearch] = useState("");
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchInstructors();
        }
    }, [token]);

    const fetchInstructors = async (expertise?: string) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await api.get(`/mentorship/instructors${expertise ? `?expertise=${expertise}` : ''}`, token);
            setInstructors(data);
        } catch (error: any) {
            console.error("Mentorship API Error:", error);
            // Handle error state if needed, but the catch-all handled by api.ts is usually enough
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchInstructors(search);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Standard Header Section - Matches Dashboard */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                        1-on-1 Mentorship
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">Connect with industry experts for personalized guidance and career growth.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/history">
                        <Button variant="outline" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            My Bookings
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search Bar - Matches Browse Courses style */}
            <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search mentors by expertise (e.g. React, UI/UX, Backend)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-12 pl-10 bg-white border-zinc-200 focus-visible:ring-indigo-500 rounded-xl font-medium"
                    />
                </form>
                <Button onClick={() => fetchInstructors(search)} className="h-12 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl font-bold">
                    Find Mentors
                </Button>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full" />
                        Available Mentors
                    </h2>
                    <span className="text-muted-foreground font-semibold text-sm">{instructors.length} professional{instructors.length !== 1 ? 's' : ''} active</span>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40 mb-4" />
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Finding matches for you...</p>
                    </div>
                ) : instructors.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-zinc-200 shadow-sm">
                        <div className="p-4 bg-zinc-50 rounded-full inline-block mb-4">
                            <GraduationCap className="h-12 w-12 text-zinc-300" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900">No mentors found</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Try searching for a different skill or clearing your search to see all available instructors.</p>
                        <Button variant="outline" onClick={() => { setSearch(""); fetchInstructors(""); }} className="mt-8 rounded-xl font-bold px-8">Refresh List</Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {instructors.map((mentor) => (
                            <Card key={mentor.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden flex flex-col">
                                <CardContent className="p-0 flex flex-col h-full">
                                    <div className="p-6 space-y-4 flex-1">
                                        <div className="flex items-start justify-between">
                                            <Avatar className="h-16 w-16 border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300 ring-2 ring-primary/5">
                                                <AvatarImage src={mentor.avatar} className="object-cover" />
                                                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary uppercase">
                                                    {mentor.name?.[0] || 'M'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-right">
                                                <div className="text-primary font-bold text-xl">₹{mentor.mentorshipFee}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">per session</div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                                                {mentor.name}
                                                <UserCheck className="h-4 w-4 text-emerald-500" />
                                            </h3>
                                            <div className="flex items-center gap-1 text-zinc-500 font-semibold text-xs">
                                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                                <span>4.9 rating</span>
                                                <span className="mx-1">•</span>
                                                <span>50+ sessions</span>
                                            </div>
                                        </div>

                                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 font-medium">
                                            {mentor.bio || "Industry expert ready to help you grow your skills and advance your career through personalized 1-on-1 sessions."}
                                        </p>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {mentor.expertise?.split(',').slice(0, 3).map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="bg-zinc-100 text-zinc-600 border-none rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                                                    {skill.trim()}
                                                </Badge>
                                            ))}
                                            {(mentor.expertise?.split(',').length || 0) > 3 && (
                                                <span className="text-[10px] font-bold text-muted-foreground self-center">
                                                    +{(mentor.expertise?.split(',').length || 0) - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0 mt-auto">
                                        {mentor.mentorshipSlots && mentor.mentorshipSlots.length > 0 ? (
                                            <Link href={`/mentorship/book/${mentor.id}`} className="block">
                                                <Button className="w-full h-11 bg-zinc-900 hover:bg-primary shadow-lg hover:shadow-primary/20 text-white rounded-xl font-bold transition-all gap-2 group/btn">
                                                    BOOK SESSION
                                                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100/50">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">No shifts available</span>
                                                </div>
                                                <Button disabled className="w-full h-11 bg-zinc-100 text-zinc-400 border-none cursor-not-allowed rounded-xl font-bold gap-2">
                                                    CONSULTATION BLOCKED
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Motivational Banner - Matches Student Theme */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-600 to-primary text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl pointer-events-none" />
                <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">Need a customized roadmap?</h2>
                        <p className="text-white/80 max-w-lg text-lg font-medium leading-relaxed">
                            Our mentors can help you build a personalized learning path based on your goals and career aspirations.
                        </p>
                    </div>
                    <Button variant="outline" className="h-14 px-10 bg-white/20 hover:bg-white border-white/20 hover:border-white text-white hover:text-primary font-bold text-lg rounded-2xl transition-all shadow-xl backdrop-blur-md">
                        Learn How it Works
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
