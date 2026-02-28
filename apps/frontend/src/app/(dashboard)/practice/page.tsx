
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BookOpen, MessageSquare, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function PracticePortalPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await api.get('/public/practice/questions'); // Assuming we expose it via public
                // If not yet in public, we use the new internal route
                // Actually I registered it in server.ts as /api/practice
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/practice/questions`);
                const data = await response.json();
                setQuestions(data);
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || q.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", "PYQ", "SSC", "UPSC", "BANK", "JEE", "NEET"];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
                        <BookOpen className="h-10 w-10 text-indigo-600" />
                        Practice Portal
                    </h1>
                    <p className="text-zinc-500 text-lg">Master your exams with hundreds of high-quality questions and PYQs.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    <span className="text-indigo-900 font-semibold">{questions.length} Questions Available</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-zinc-200 shadow-sm sticky top-24">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="h-5 w-5 text-indigo-600" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                    <Input
                                        placeholder="Find a problem..."
                                        className="pl-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <Badge
                                            key={cat}
                                            variant={categoryFilter === cat ? "default" : "outline"}
                                            className={cn(
                                                "cursor-pointer px-3 py-1 text-sm capitalize",
                                                categoryFilter === cat ? "bg-indigo-600" : "hover:bg-indigo-50"
                                            )}
                                            onClick={() => setCategoryFilter(cat)}
                                        >
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Question List */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-xl border border-zinc-200"></div>
                            ))}
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
                            <Search className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-zinc-900">No questions found</h3>
                            <p className="text-zinc-500">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredQuestions.map((q) => (
                                <Link key={q.id} href={`/practice/${q.id}`}>
                                    <Card className="group hover:border-indigo-400 transition-all cursor-pointer shadow-sm hover:shadow-md">
                                        <CardContent className="p-5 flex items-center justify-between gap-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-100 uppercase text-[10px] font-bold tracking-widest">
                                                        {q.category || 'PRACTICE'}
                                                    </Badge>
                                                    {q.category === 'PYQ' && (
                                                        <Badge className="bg-amber-500 hover:bg-amber-600 border-0 text-[10px] font-bold">PREVIOUS YEAR</Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-semibold text-zinc-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                    {q.text}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-zinc-400">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span className="text-sm font-medium">{q._count?.comments || 0}</span>
                                                </div>
                                                <Button variant="ghost" className="group-hover:bg-indigo-600 group-hover:text-white rounded-full h-10 w-10 p-0 transition-all">
                                                    <BookOpen className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
