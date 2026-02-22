
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Calendar, Star, GraduationCap, MapPin } from "lucide-react";
import Link from "next/link";

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
    const { token } = useAuth();
    const [search, setSearch] = useState("");
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInstructors();
    }, [token]);

    const fetchInstructors = async (expertise?: string) => {
        setIsLoading(true);
        try {
            const data = await api.get(`/mentorship/instructors${expertise ? `?expertise=${expertise}` : ''}`, token!);
            setInstructors(data);
        } catch (error) {
            console.error("Failed to fetch instructors", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchInstructors(search);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto px-4 py-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-10 md:p-16 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px]" />

                <div className="relative z-10 space-y-8 text-center md:text-left">
                    <div className="space-y-4 max-w-2xl">
                        <Badge variant="outline" className="px-4 py-1.5 bg-white/5 text-primary border-primary/20 rounded-full text-xs font-black tracking-[0.2em] uppercase">
                            1-on-1 Mentorship
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
                            Find Your <span className="text-primary italic">Perfect Mentor</span>
                        </h1>
                        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                            Book a private session with industry experts to accelerate your career, clear doubts, or get personalized guidance.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-3xl">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                            <Input
                                placeholder="Search by expertise (e.g. React, UI/UX, Backend)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-16 pl-12 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all font-medium text-lg placeholder:text-zinc-600"
                            />
                        </div>
                        <Button type="submit" className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20 active:scale-[0.98]">
                            SEARCH
                        </Button>
                    </form>
                </div>
            </div>

            {/* Instructors Grid */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black tracking-tight text-zinc-900">Featured <span className="text-primary">Instructors</span></h2>
                    <span className="text-zinc-500 font-bold text-sm uppercase tracking-widest">{instructors.length} found</span>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Finding available mentors...</p>
                    </div>
                ) : instructors.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200">
                        <GraduationCap className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                        <p className="text-zinc-500 font-black text-xl">No mentors found for "{search}"</p>
                        <p className="text-zinc-400 mt-2 font-medium">Try searching for a different skill or topic.</p>
                        <Button variant="outline" onClick={() => { setSearch(""); fetchInstructors(""); }} className="mt-8 rounded-xl font-bold">Clear Search</Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {instructors.map((mentor) => (
                            <Card key={mentor.id} className="group border-0 bg-white shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-[2rem] overflow-hidden border-b-4 border-transparent hover:border-primary">
                                <CardContent className="p-0">
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <Avatar className="h-24 w-24 border-4 border-zinc-50 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                                <AvatarImage src={mentor.avatar} className="object-cover" />
                                                <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary uppercase">
                                                    {mentor.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-right">
                                                <div className="text-primary font-black text-2xl">₹{mentor.mentorshipFee}</div>
                                                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">per session</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black tracking-tight text-zinc-900 group-hover:text-primary transition-colors">{mentor.name}</h3>
                                            <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-sm uppercase tracking-wide">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span>4.9 (48 Reviews)</span>
                                            </div>
                                        </div>

                                        <p className="text-zinc-500 font-medium line-clamp-3 leading-relaxed text-sm">
                                            {mentor.bio || "No bio provided."}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {mentor.expertise?.split(',').map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="bg-zinc-100 text-zinc-600 border-0 rounded-lg px-3 py-1 text-[11px] font-bold">
                                                    {skill.trim()}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-8 pt-0 mt-auto">
                                        <Link href={`/mentorship/book/${mentor.id}`} className="block">
                                            <Button className="w-full h-14 bg-zinc-900 hover:bg-primary text-white rounded-2xl font-black text-lg transition-all gap-3 active:scale-[0.98]">
                                                <Calendar className="h-5 w-5" /> BOOK SESSION
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
