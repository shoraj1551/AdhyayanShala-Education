"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PlayCircle, FileText, CheckCircle, ChevronLeft, ChevronRight, Menu, BookOpen, Download, ExternalLink, Video, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ReviewSection } from "@/components/ReviewSection";
import { toast } from "sonner";
import { EnrollmentModal } from "@/components/EnrollmentModal";
import { CourseSidebar } from "@/components/CourseSidebar";
import { NotesTab } from "@/components/NotesTab";
import { StudentScheduleView } from "@/components/StudentScheduleView";
import { LessonDiscussion } from "@/components/LessonDiscussion";
import { TestPlayer } from "@/components/TestPlayer";
import { VideoPlayer } from "@/components/VideoPlayer";
import { JoinLiveClass } from "@/components/JoinLiveClass";
import { LiveCourseGuestView } from "@/components/LiveCourseGuestView";

interface Lesson {
    id: string;
    title: string;
    type: 'VIDEO' | 'TEXT';
    duration: number;
    content?: string;
    videoUrl?: string;
    summary?: string;
    attachmentUrl?: string;
    resources?: { title: string, url: string }[];
}

interface Test {
    id: string;
    title: string;
    type: 'QUIZ';
    duration: number;
}

type ContentItem = Lesson | Test;

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
    tests?: Test[];
}

export interface CourseContent {
    id: string;
    title: string;
    description: string;
    type: string;
    modules: Module[];
    tests: unknown[];
    instructor?: { id: string; name: string; email?: string };
    _count: { modules: number, tests: number };
    price: number;
    discountedPrice?: number;
    isFree?: boolean;
    meetingLink?: string;   // For LIVE courses — clickable join link
    brochureUrl?: string;
}

export default function CoursePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const { token, user } = useAuth();
    const [course, setCourse] = useState<CourseContent | null>(null);
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
    const [enrollmentLoading, setEnrollmentLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
    const [demoForm, setDemoForm] = useState({ name: '', email: '', phone: '' });
    const [submittingDemo, setSubmittingDemo] = useState(false);

    const handleDemoRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingDemo(true);
        try {
            await api.post('/contact/inquiry', {
                name: demoForm.name,
                email: demoForm.email,
                phone: demoForm.phone,
                subject: `Demo Request: ${course?.title}`,
                message: `User requested a demo for LIVE course: ${course?.title} (ID: ${course?.id})`,
                type: 'DEMO_REQUEST'
            });
            toast.success("Demo request submitted successfully! The instructor will contact you soon.");
            setDemoForm({ name: '', email: '', phone: '' });
        } catch {
            toast.error("Failed to submit demo request. Please try again.");
        } finally {
            setSubmittingDemo(false);
        }
    };

    // Reset error when lesson changes
    // Reset error when content changes
    useEffect(() => {
        setVideoError(false);
    }, [selectedContent?.id]);

    useEffect(() => {
        if (!params.id) return;

        setLoading(true);
        // Fetch Course (Public)
        api.get(`/courses/${params.id}`, token || undefined)
            .then(data => {
                setCourse(data);
                // Default to first lesson/test on initial load (only set once)
                setSelectedContent(prev => {
                    if (prev) return prev;
                    if (data.modules?.length > 0) {
                        const firstModule = data.modules[0];
                        if (firstModule.lessons?.length > 0) return firstModule.lessons[0];
                        if (firstModule.tests?.length > 0) return firstModule.tests[0];
                    }
                    return null;
                });
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

        // Fetch Enrollment Status (Authenticated Only)
        if (token) {
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
        } else {
            setIsEnrolled(false);
            setEnrollmentLoading(false);
        }
    }, [token, params.id]);

    const handleEnroll = useCallback(async () => {
        if (!token) {
            toast.info("Please register to enroll in this course.");
            router.push(`/register?redirect=/courses/${params.id}&enroll=true`);
            return;
        }
        if (course?.isFree) {
            try {
                await api.post(`/courses/${params.id}/enroll`, {}, token);
                setIsEnrolled(true);
                toast.success("Enrolled successfully in free course!");
            } catch {
                alert("Failed to enroll.");
            }
        } else {
            setIsEnrollmentModalOpen(true);
        }
    }, [token, params.id, router, course?.isFree]);

    // Auto-trigger enrollment if coming from redirect
    const searchParams = useSearchParams();
    useEffect(() => {
        const triggerEnroll = searchParams.get("enroll") === "true";
        if (triggerEnroll && token && course && !isEnrolled && !loading && !enrollmentLoading) {
            // Remove the param from URL to prevent re-triggering if they refresh
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            handleEnroll();
        }
    }, [searchParams, token, course, isEnrolled, loading, enrollmentLoading, handleEnroll]);

    if (loading || enrollmentLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!course) return <div className="p-8 text-center">Course not found.</div>;

    // Check for Module 1 Preview or Enrollment
    // Helper to check if content is locked
    const isLocked = (content: ContentItem) => {
        if (isEnrolled) return false;
        if (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') return false;

        // Find which module this content belongs to
        const moduleIndex = course.modules.findIndex(m =>
            m.lessons.some(l => l.id === content.id) || m.tests?.some(t => t.id === content.id)
        );

        if (course.type === 'LIVE') {
            return true;
        }

        // Allow Module 1 and 2 (Index 0 and 1)
        return moduleIndex !== 0 && moduleIndex !== 1;
    };

    const currentContentLocked = selectedContent ? isLocked(selectedContent) : false;

    // Check if user is a guest viewing a LIVE course
    const isLiveGuest = course.type === 'LIVE' && !isEnrolled && user?.role !== 'ADMIN' && user?.role !== 'INSTRUCTOR';

    if (isLiveGuest) {
        return (
            <>
                <LiveCourseGuestView course={course} handleEnroll={handleEnroll} />
                <EnrollmentModal
                    isOpen={isEnrollmentModalOpen}
                    onClose={() => setIsEnrollmentModalOpen(false)}
                    onSuccess={() => setIsEnrolled(true)}
                    course={course}
                />
            </>
        );
    }

    // Navigation logic
    const allContent: ContentItem[] = [];
    course.modules.forEach(m => {
        const moduleContent = [...m.lessons, ...(m.tests || [])];
        moduleContent.sort((a: ContentItem & { order?: number }, b: ContentItem & { order?: number }) => (a.order || 0) - (b.order || 0));
        allContent.push(...moduleContent);
    });

    const currentIndex = allContent.findIndex(l => l.id === selectedContent?.id);
    const hasNext = currentIndex < allContent.length - 1;
    const hasPrev = currentIndex > 0;

    const handleNext = () => { if (hasNext) setSelectedContent(allContent[currentIndex + 1]); };
    const handlePrev = () => { if (hasPrev) setSelectedContent(allContent[currentIndex - 1]); };



    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const trimmedUrl = url.trim();
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = trimmedUrl.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Helper to check if content is a Lesson vs Test
    const isLesson = (content: ContentItem): content is Lesson => {
        return content.type === 'VIDEO' || content.type === 'TEXT';
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
                    {course.instructor?.id && (
                        <Button variant="outline" size="sm" asChild className="hidden md:flex bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 mr-2">
                            <Link href={`/mentorship/book/${course.instructor.id}`}>
                                Book Mentorship
                            </Link>
                        </Button>
                    )}
                    <Link href="/dashboard" className="hidden md:flex items-center gap-2 mr-4 text-sm text-zinc-400 hover:text-white transition-colors">
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
                    {selectedContent ? (
                        <>
                            {/* TEST PLAYER */}
                            {!isLesson(selectedContent) ? (
                                <div className="p-6 h-full overflow-y-auto">
                                    <TestPlayer testId={selectedContent.id} />
                                </div>
                            ) : (
                                /* LESSON PLAYER */
                                <>
                                    <div className="bg-black w-full min-h-[400px] lg:h-[65vh] flex flex-col justify-center items-center relative group shadow-inner">
                                        {currentContentLocked ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 text-white z-10 p-8 text-center overflow-y-auto w-full h-full">
                                                {course.type === 'LIVE' ? (
                                                    <div className="bg-zinc-800 p-6 sm:p-8 rounded-2xl max-w-md w-full border border-zinc-700 shadow-2xl my-auto">
                                                        <Video className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                                                        <h3 className="text-2xl font-bold mb-2">Live Class Demo</h3>
                                                        <p className="text-zinc-400 mb-6 text-sm">
                                                            This is a live interactive course. Request a demo or callback to learn more before enrolling.
                                                        </p>
                                                        <form onSubmit={handleDemoRequest} className="space-y-4 text-left">
                                                            <div>
                                                                <label className="text-xs font-medium text-zinc-300">Name</label>
                                                                <Input
                                                                    required
                                                                    placeholder="Your Name"
                                                                    className="bg-zinc-900 border-zinc-700 text-white mt-1"
                                                                    value={demoForm.name}
                                                                    onChange={e => setDemoForm({ ...demoForm, name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-zinc-300">Email</label>
                                                                <Input
                                                                    required
                                                                    type="email"
                                                                    placeholder="you@example.com"
                                                                    className="bg-zinc-900 border-zinc-700 text-white mt-1"
                                                                    value={demoForm.email}
                                                                    onChange={e => setDemoForm({ ...demoForm, email: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-zinc-300">Phone (Optional)</label>
                                                                <Input
                                                                    type="tel"
                                                                    placeholder="Your Phone Number"
                                                                    className="bg-zinc-900 border-zinc-700 text-white mt-1"
                                                                    value={demoForm.phone}
                                                                    onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="pt-2 flex flex-col gap-3">
                                                                <Button type="submit" disabled={submittingDemo} className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white">
                                                                    {submittingDemo ? "Submitting..." : "Request Demo"}
                                                                </Button>
                                                                <Button variant="outline" type="button" className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white" onClick={handleEnroll}>
                                                                    Enroll Now Instead
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                ) : (
                                                    <div className="bg-zinc-800 p-6 sm:p-8 rounded-2xl max-w-md w-full border border-zinc-700 shadow-2xl my-auto">
                                                        <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
                                                        <h3 className="text-2xl font-bold mb-2">Content Locked</h3>
                                                        <p className="text-zinc-400 mb-6 font-medium">
                                                            Register or Log in to unlock the rest of the course modules and continue learning!
                                                        </p>
                                                        <div className="flex flex-col gap-3">
                                                            <Button size="lg" className="w-full font-bold text-lg" onClick={handleEnroll}>
                                                                Enroll Now
                                                            </Button>
                                                            {!token && (
                                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                                    <Button variant="outline" className="w-full bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-white" asChild>
                                                                        <Link href="/login">Log In</Link>
                                                                    </Button>
                                                                    <Button variant="secondary" className="w-full bg-zinc-700 hover:bg-zinc-600 text-white" asChild>
                                                                        <Link href="/register">Register</Link>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : selectedContent.type === 'VIDEO' ? (
                                            selectedContent.videoUrl && getYoutubeId(selectedContent.videoUrl) ? (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedContent.videoUrl)}`}
                                                    title={selectedContent.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="absolute inset-0 w-full h-full"
                                                />
                                            ) : selectedContent.videoUrl ? (
                                                <div className="relative w-full h-full bg-black flex items-center justify-center">
                                                    {!videoError ? (
                                                        <div className="w-full max-w-5xl aspect-video mx-auto">
                                                            <VideoPlayer src={selectedContent.videoUrl} />
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-4 p-8 text-center bg-zinc-900/50">
                                                            <div className="p-4 rounded-full bg-zinc-800/50">
                                                                <Video className="h-12 w-12 text-red-500/50" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-semibold text-white mb-2">Video Unavailable</h3>
                                                                <p className="max-w-md mx-auto mb-6">
                                                                    We couldn&apos;t load this video. It might be a broken link or an unsupported format.
                                                                </p>
                                                                <Button variant="outline" asChild className="gap-2">
                                                                    <a href={selectedContent.videoUrl} target="_blank" rel="noopener noreferrer">
                                                                        <ExternalLink className="h-4 w-4" />
                                                                        Try Direct Link
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
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
                                                    <h2 className="text-3xl font-bold">{selectedContent.title}</h2>
                                                    <p className="text-muted-foreground">This is a text-based lesson. Read the content below.</p>
                                                    <Button variant="outline" onClick={() => document.getElementById('lesson-details')?.scrollIntoView({ behavior: 'smooth' })}>
                                                        Scroll to Content <ChevronRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8" id="lesson-details">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                                            <h2 className="text-2xl font-bold">{selectedContent.title}</h2>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={async () => {
                                                        if (!token) return;
                                                        try {
                                                            await api.post('/progress/complete', { lessonId: selectedContent.id }, token);
                                                            setCompletedLessonIds(prev => [...prev, selectedContent.id]);
                                                            toast.success("Lesson marked as complete!");
                                                            if (hasNext) handleNext();
                                                        } catch {
                                                            toast.error("Failed to mark complete");
                                                        }
                                                    }}
                                                    disabled={completedLessonIds.includes(selectedContent.id) || !isEnrolled || !token}
                                                    variant={completedLessonIds.includes(selectedContent.id) ? "secondary" : "default"}
                                                >
                                                    {completedLessonIds.includes(selectedContent.id) ? (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Completed
                                                        </>
                                                    ) : !isEnrolled ? (
                                                        "Login to track progress"
                                                    ) : (
                                                        "Mark as Complete"
                                                    )}
                                                </Button>
                                                {/* Navigation Buttons */}
                                                <Button variant="outline" size="icon" onClick={handlePrev} disabled={!hasPrev}>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={handleNext} disabled={!hasNext}>
                                                    <ChevronRight className="h-4 w-4" />
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
                                                {course.type === 'LIVE' && <TabsTrigger value="schedule" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-semibold data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground">Schedule</TabsTrigger>}
                                            </TabsList>

                                            <TabsContent value="overview" className="pt-6">
                                                <div className="prose dark:prose-invert max-w-none">
                                                    <h3 className="text-lg font-bold mb-2">About this lesson</h3>
                                                    <p className="text-muted-foreground leading-relaxed">
                                                        {selectedContent.summary || "No summary provided for this lesson."}
                                                    </p>
                                                    {selectedContent.content && (
                                                        <div className="mt-8 pt-8 border-t">
                                                            <div dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>

                                            {/* ... Resources, Reviews, QA same for now ... */}
                                            <TabsContent value="resources" className="pt-6">
                                                <h3 className="font-bold mb-4">Downloadable Resources</h3>
                                                <div className="grid gap-3 max-w-xl">
                                                    {selectedContent.attachmentUrl ? (
                                                        <div className="flex items-center justify-between p-4 border rounded-md hover:border-primary/50 transition-colors bg-card">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="h-10 w-10 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                                                    <FileText className="h-5 w-5" />
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="font-medium text-sm truncate">{selectedContent.attachmentUrl.split('/').pop() || "Attached File"}</p>
                                                                    <p className="text-xs text-muted-foreground">Resource File</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 shrink-0">
                                                                <Button variant="ghost" size="sm" asChild><a href={selectedContent.attachmentUrl} target="_blank" rel="noopener noreferrer">View</a></Button>
                                                                <Button variant="outline" size="icon" asChild><a href={selectedContent.attachmentUrl} download><Download className="h-4 w-4" /></a></Button>
                                                            </div>
                                                        </div>
                                                    ) : null}

                                                    {selectedContent.resources && selectedContent.resources.length > 0 ? (
                                                        selectedContent.resources.map((res: { title: string, url: string }, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between p-4 border rounded-md hover:border-primary/50 transition-colors bg-card">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0">
                                                                        <ExternalLink className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="truncate">
                                                                        <p className="font-medium text-sm truncate">{res.title || "External Resource"}</p>
                                                                        <p className="text-xs text-muted-foreground">Link / Download</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 shrink-0">
                                                                    <Button variant="ghost" size="sm" asChild><a href={res.url} target="_blank" rel="noopener noreferrer">Open</a></Button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : null}

                                                    {!selectedContent.attachmentUrl && (!selectedContent.resources || selectedContent.resources.length === 0) && (
                                                        <p className="text-muted-foreground text-sm">No resources available.</p>
                                                    )}
                                                </div>
                                            </TabsContent>



                                            <TabsContent value="reviews" className="pt-6">
                                                <ReviewSection courseId={course.id} />
                                            </TabsContent>

                                            <TabsContent value="notes" className="pt-6">
                                                {selectedContent && <NotesTab lessonId={selectedContent.id} />}
                                            </TabsContent>

                                            <TabsContent value="schedule" className="pt-6">
                                                {/* Live Class Join Button (LIVE courses only) */}
                                                {course.type === "LIVE" && (
                                                    <div className="mb-6">
                                                        <JoinLiveClass
                                                            courseId={course.id}
                                                            isEnrolled={isEnrolled}
                                                            fallbackLink={course.meetingLink}
                                                        />
                                                    </div>
                                                )}
                                                <StudentScheduleView courseId={course.id} isEnrolled={isEnrolled} />
                                            </TabsContent>

                                            <TabsContent value="qa" className="pt-6">
                                                {selectedContent && <LessonDiscussion lessonId={selectedContent.id} />}
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </>
                            )}
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
                        currentLessonId={selectedContent?.id}
                        onSelectLesson={setSelectedContent}
                        completedLessonIds={completedLessonIds}
                        isEnrolled={isEnrolled}
                    />
                </div>

                {/* Mobile Sidebar (Sheet) */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="right" className="p-0 w-80 md:hidden">
                        <SheetTitle className="hidden">Course Content</SheetTitle>
                        <CourseSidebar
                            course={course}
                            currentLessonId={selectedContent?.id}
                            onSelectLesson={(content) => { setSelectedContent(content); setSidebarOpen(false); }}
                            completedLessonIds={completedLessonIds}
                            isEnrolled={isEnrolled}
                        />
                    </SheetContent>
                </Sheet>

                {course && (
                    <EnrollmentModal
                        isOpen={isEnrollmentModalOpen}
                        onClose={() => setIsEnrollmentModalOpen(false)}
                        onSuccess={() => setIsEnrolled(true)}
                        course={course}
                    />
                )}
            </div>
        </div>
    );
}
