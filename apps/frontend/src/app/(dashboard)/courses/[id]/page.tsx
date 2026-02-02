"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { PlayCircle, FileText, CheckCircle, ChevronLeft, ChevronRight, Menu, X, BookOpen, MessageSquare, Download, Play, Trophy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ReviewSection } from "@/components/ReviewSection";

interface Lesson {
    id: string;
    title: string;
    type: 'VIDEO' | 'TEXT';
    duration: number;
    content?: string;
    videoUrl?: string;
    summary?: string;
    attachmentUrl?: string;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface CourseContent {
    id: string;
    title: string;
    description: string;
    modules: Module[];
    tests: any[];
    instructor: { name: string };
    _count: { modules: number, tests: number };
}

import { CourseSidebar } from "@/components/CourseSidebar";
import { NotesTab } from "@/components/NotesTab";
import { StudentScheduleView } from "@/components/StudentScheduleView";

// ... previous imports

export default function CoursePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const { token, user } = useAuth();
    const [course, setCourse] = useState<CourseContent | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
    const [enrollmentLoading, setEnrollmentLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (token && params.id) {
            // Fetch Course
            api.get(`/courses/${params.id}`, token)
                .then(data => {
                    setCourse(data);
                    if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
                        setSelectedLesson(data.modules[0].lessons[0]);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));

            // Fetch Enrollment Status & Progress
            api.get(`/courses/${params.id}/status`, token)
                .then(data => {
                    setIsEnrolled(data.isEnrolled);
                    if (data.completedLessonIds) setCompletedLessonIds(data.completedLessonIds);
                })
                .catch(err => {
                    console.error("Enrollment check failed", err);
                    setIsEnrolled(false);
                })
                .finally(() => setEnrollmentLoading(false));

            // Mark current lesson as complete (Simple logic: if viewed, mark complete)
            // Ideally should be triggered by video end or scrolling bottom.
            // For now, let's just trigger it when selectedLesson changes? No, that's too aggressive.
            // Let's leave completion marking for "Next Lesson" or explicit action for now.
        }
    }, [token, params.id]);

    const handleEnroll = async () => {
        if (!token) return;
        try {
            await api.post(`/courses/${params.id}/enroll`, {}, token);
            setIsEnrolled(true);
        } catch (error) {
            alert("Failed to enroll.");
        }
    }

    if (loading || enrollmentLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!course) return <div className="p-8 text-center">Course not found.</div>;

    // Admin/Instructor bypass
    const canAccess = isEnrolled || user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

    if (!canAccess) {
        return (
            <div className="min-h-screen bg-background">
                {/* Hero / Access Denied View - SAME AS BEFORE */}
                <div className="bg-zinc-900 text-white py-20 px-6 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{course.title}</h1>
                    <p className="mt-4 text-xl text-zinc-300 max-w-2xl mx-auto">{course.description || "Unlock your potential with this comprehensive course."}</p>
                    <div className="mt-8">
                        <Button size="lg" className="text-lg px-8 py-6 rounded-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all" onClick={handleEnroll}>
                            Enroll Now
                        </Button>
                    </div>
                </div>
                <div className="container mx-auto px-6 py-12">
                    <h3 className="text-2xl font-bold mb-6">Course Content</h3>
                    <div className="border rounded-lg overflow-hidden bg-white max-w-4xl mx-auto">
                        {course.modules.map((m, i) => (
                            <div key={m.id} className="border-b last:border-0 p-4 flex justify-between items-center hover:bg-muted/20">
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-muted-foreground">Section {i + 1}</span>
                                    <span className="font-medium">{m.title}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{m.lessons.length} lectures</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Navigation logic
    let allLessons: Lesson[] = [];
    course.modules.forEach(m => allLessons.push(...m.lessons));
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson?.id);
    const hasNext = currentIndex < allLessons.length - 1;
    const hasPrev = currentIndex > 0;

    const handleNext = () => { if (hasNext) setSelectedLesson(allLessons[currentIndex + 1]); };
    const handlePrev = () => { if (hasPrev) setSelectedLesson(allLessons[currentIndex - 1]); };

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="h-14 bg-zinc-900 border-b border-zinc-800 text-white flex items-center justify-between px-4 shrink-0 z-20 shadow-md">
                <div className="flex items-center gap-4 overflow-hidden">
                    <Link href="/" className="font-bold text-lg hover:text-zinc-300 transition-colors">SHORAJ</Link>
                    <Separator orientation="vertical" className="h-6 bg-zinc-700" />
                    <h1 className="font-medium truncate hidden sm:block text-zinc-300 max-w-xl">{course.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/" className="hidden md:flex items-center gap-2 mr-4 text-sm text-zinc-400 hover:text-white transition-colors">
                        Exit Course
                    </Link>
                    <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Left Side: Player & Content */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950 scroll-smooth">
                    {/* Dark Player Area */}
                    {selectedLesson ? (
                        <>
                            <div className="bg-black w-full min-h-[400px] lg:h-[65vh] flex flex-col justify-center items-center relative group shadow-inner">
                                {selectedLesson.type === 'VIDEO' ? (
                                    selectedLesson.videoUrl && getYoutubeId(selectedLesson.videoUrl) ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${getYoutubeId(selectedLesson.videoUrl)}`}
                                            title={selectedLesson.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="absolute inset-0 w-full h-full"
                                        />
                                    ) : selectedLesson.videoUrl ? (
                                        <div className="relative w-full h-full">
                                            <video
                                                controls
                                                className="absolute inset-0 w-full h-full focus:outline-none"
                                                src={selectedLesson.videoUrl}
                                                onError={(e) => console.error("Video Error:", e)}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="secondary" size="sm" asChild className="bg-white/90 text-black hover:bg-white">
                                                    <a href={selectedLesson.videoUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4 mr-2" /> Open Externally
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-zinc-500 space-y-4">
                                            <PlayCircle className="h-24 w-24 mx-auto opacity-50" />
                                            <p>No video source provided.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="bg-white dark:bg-zinc-900 text-foreground p-12 w-full h-full overflow-y-auto flex items-center justify-center">
                                        <div className="text-center space-y-6 max-w-lg">
                                            <FileText className="h-20 w-20 mx-auto text-primary/40" />
                                            <h2 className="text-3xl font-bold">{selectedLesson.title}</h2>
                                            <p className="text-muted-foreground">This is a text-based lesson. Read the content below.</p>
                                            <Button variant="outline" onClick={() => document.getElementById('lesson-details')?.scrollIntoView({ behavior: 'smooth' })}>
                                                Scroll to Content <ChevronRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Lesson Details & Navigation */}
                            <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8" id="lesson-details">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                                    <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
                                    <div className="flex gap-3">
                                        <Button variant="outline" disabled={!hasPrev} onClick={handlePrev}>
                                            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                        </Button>
                                        <Button disabled={!hasNext} onClick={handleNext}>
                                            Next Lesson <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>

                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
                                        <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-semibold data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground">Overview</TabsTrigger>
                                        <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-semibold data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground">Resources</TabsTrigger>
                                        <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-semibold data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground">Reviews</TabsTrigger>
                                        <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-semibold data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground">Notes</TabsTrigger>
                                        <TabsTrigger value="qa" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-semibold data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground">Q&A</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="pt-6">
                                        <div className="prose dark:prose-invert max-w-none">
                                            <h3 className="text-lg font-bold mb-2">About this lesson</h3>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {selectedLesson.summary || "No summary provided for this lesson."}
                                            </p>
                                            {selectedLesson.content && (
                                                <div className="mt-8 pt-8 border-t">
                                                    <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* ... Resources, Reviews, QA same for now ... */}
                                    <TabsContent value="resources" className="pt-6">
                                        <h3 className="font-bold mb-4">Downloadable Resources</h3>
                                        <div className="grid gap-3 max-w-md">
                                            {selectedLesson.attachmentUrl ? (
                                                <div className="flex items-center justify-between p-4 border rounded-md hover:border-primary/50 transition-colors bg-card">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="h-10 w-10 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="font-medium text-sm truncate">{selectedLesson.attachmentUrl.split('/').pop() || "Attached File"}</p>
                                                            <p className="text-xs text-muted-foreground">Resource File</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <Button variant="ghost" size="sm" asChild><a href={selectedLesson.attachmentUrl} target="_blank" rel="noopener noreferrer">View</a></Button>
                                                        <Button variant="outline" size="icon" asChild><a href={selectedLesson.attachmentUrl} download><Download className="h-4 w-4" /></a></Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground text-sm">No resources available.</p>
                                            )}
                                        </div>
                                    </TabsContent>



                                    <TabsContent value="reviews" className="pt-6">
                                        {/* @ts-ignore */}
                                        <ReviewSection courseId={course.id} />
                                    </TabsContent>

                                    <TabsContent value="notes" className="pt-6">
                                        {selectedLesson && <NotesTab lessonId={selectedLesson.id} />}
                                    </TabsContent>

                                    <TabsContent value="schedule" className="pt-6">
                                        <StudentScheduleView courseId={course.id} />
                                    </TabsContent>

                                    <TabsContent value="qa" className="pt-6">
                                        <div className="text-center py-10 border rounded-lg bg-muted/20 border-dashed">
// ...
                                            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                            <h3 className="font-semibold">No questions yet</h3>
                                            <p className="text-sm text-muted-foreground mb-4">Be the first to ask a question about this lesson.</p>
                                            <Button>Ask a Question</Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-10">
                            <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                            <p>Select a lesson from the course content to start watching.</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Sidebar (Desktop) */}
                <div className="hidden md:block w-96 border-l shrink-0 bg-white dark:bg-zinc-900 h-full relative z-10 p-0">
                    <CourseSidebar
                        course={course}
                        currentLessonId={selectedLesson?.id}
                        onSelectLesson={setSelectedLesson}
                        completedLessonIds={completedLessonIds}
                    />
                </div>

                {/* Mobile Sidebar (Sheet) */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="right" className="p-0 w-80 md:hidden">
                        <SheetTitle className="hidden">Course Content</SheetTitle>
                        <CourseSidebar
                            course={course}
                            currentLessonId={selectedLesson?.id}
                            onSelectLesson={(lesson) => { setSelectedLesson(lesson); setSidebarOpen(false); }}
                            completedLessonIds={completedLessonIds}
                        />
                    </SheetContent>
                </Sheet>

            </div>
        </div>
    );
}
