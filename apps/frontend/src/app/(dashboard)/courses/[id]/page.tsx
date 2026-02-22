"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PlayCircle, FileText, CheckCircle, ChevronLeft, ChevronRight, Menu, BookOpen, Download, ExternalLink, Video, Lock, Users, Clock } from "lucide-react";
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
    order: number;
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
    tests: Test[];
    order: number;
}

export interface CourseContent {
    id: string;
    title: string;
    description: string;
    type: string;
    level: string;
    modules: Module[];
    tests: unknown[];
    instructor?: {
        id: string;
        name: string;
        email?: string;
        avatar?: string;
        bio?: string;
    };
    _count: { modules: number, tests: number, enrollments?: number };
    price: number;
    discountedPrice?: number;
    isFree?: boolean;
    meetingLink?: string;
    brochureUrl?: string;
    promoVideoUrl?: string;
    thumbnailUrl?: string;
    updatedAt: string;
}

const CourseLandingView = ({
    course,
    onStartLearning,
    handleEnroll,
    isEnrolled
}: {
    course: CourseContent,
    onStartLearning: () => void,
    handleEnroll: () => void,
    isEnrolled: boolean
}) => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative bg-white pt-24 pb-32 px-4 border-b border-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-2xl text-[10px] font-black tracking-[0.2em] border border-primary/10 uppercase">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.level} Level Curriculum</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.1] text-zinc-950">
                            {course.title}
                        </h1>
                        <p className="text-xl text-zinc-500 leading-relaxed max-w-xl font-semibold">
                            {course.description || "Transform your career with our industry-validated curriculum and personalized mentorship program."}
                        </p>

                        <div className="flex flex-wrap gap-5 pt-4">
                            {isEnrolled ? (
                                <Button size="lg" onClick={onStartLearning} className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 h-16 rounded-[1.5rem] text-xl font-black shadow-xl shadow-primary/20 group transition-all">
                                    Continue Learning
                                    <PlayCircle className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            ) : (
                                <>
                                    <Button size="lg" onClick={handleEnroll} className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 h-16 rounded-[1.5rem] text-xl font-black shadow-xl shadow-primary/20 transition-all">
                                        Enroll Now - ₹{(course.discountedPrice || course.price).toLocaleString()}
                                    </Button>
                                    <Button size="lg" variant="outline" onClick={onStartLearning} className="border-slate-200 bg-white hover:bg-slate-50 text-zinc-950 px-10 h-16 rounded-[1.5rem] text-xl font-black shadow-sm transition-all">
                                        Free Preview
                                    </Button>
                                    {course.brochureUrl && (
                                        <Button size="lg" variant="ghost" asChild className="text-primary hover:bg-primary/5 px-10 h-16 rounded-[1.5rem] text-xl font-black transition-all">
                                            <a href={course.brochureUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                <Download className="h-6 w-6" />
                                                Brochure
                                            </a>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="relative space-y-6">
                        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-200 group animate-in fade-in slide-in-from-right duration-1000">
                            {course.promoVideoUrl ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${course.promoVideoUrl.split('v=')[1]?.split('&')[0] || course.promoVideoUrl.split('/').pop()}`}
                                    title="Promotional Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                />
                            ) : (
                                <img
                                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200"}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            )}
                            {!course.promoVideoUrl && (
                                <div className="absolute inset-0 bg-zinc-900/60 flex flex-col items-center justify-center group-hover:bg-zinc-900/40 transition-all cursor-pointer" onClick={onStartLearning}>
                                    <div className="h-24 w-24 bg-white/20 backdrop-blur-3xl border border-white/30 rounded-full flex items-center justify-center group-hover:scale-125 transition-all shadow-2xl">
                                        <PlayCircle className="h-12 w-12 text-white" />
                                    </div>
                                    <p className="mt-6 text-[10px] font-black tracking-[0.3em] uppercase opacity-80 group-hover:opacity-100 transition-opacity text-white">Preview Module</p>
                                </div>
                            )}
                        </div>
                        {course.promoVideoUrl && (
                            <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl w-fit mx-auto lg:mx-0 shadow-sm">
                                <Video className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">Course Introduction & Promotional Video</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <main className="max-w-7xl mx-auto px-4 py-24 grid lg:grid-cols-3 gap-20">
                <div className="lg:col-span-2 space-y-20">
                    {/* Course Overview */}
                    <section className="space-y-10">
                        <div className="flex items-end justify-between">
                            <div className="space-y-4">
                                <h2 className="text-5xl font-black tracking-tight flex items-center gap-4">
                                    <BookOpen className="h-10 w-10 text-primary" />
                                    Curriculum
                                </h2>
                                <p className="text-zinc-500 font-bold text-lg">Master the skills with our comprehensive step-by-step program.</p>
                            </div>
                            {course.brochureUrl && (
                                <Button variant="ghost" asChild className="hidden sm:flex text-primary hover:text-primary/80 font-black gap-2 h-12 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10">
                                    <a href={course.brochureUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-5 w-5" />
                                        Download Brochure
                                    </a>
                                </Button>
                            )}
                        </div>

                        <div className="space-y-8">
                            {course.modules.sort((a, b) => (a.order || 0) - (b.order || 0)).map((module, mIdx) => (
                                <div key={module.id} className="border border-muted rounded-[2.5rem] overflow-hidden bg-muted/20 hover:bg-muted/30 transition-all duration-500 group">
                                    <div className="px-10 py-8 flex justify-between items-center bg-background/50 border-b border-muted">
                                        <div className="flex items-center gap-6">
                                            <span className="w-12 h-12 bg-white text-zinc-950 border border-slate-200 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:shadow-md transition-all">
                                                {String(mIdx + 1).padStart(2, '0')}
                                            </span>
                                            <h3 className="text-2xl font-black tracking-tight">{module.title}</h3>
                                        </div>
                                        {mIdx < 2 && (
                                            <span className="bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-green-500/20">
                                                Free Preview
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-6 space-y-3">
                                        {module.lessons.sort((a, b) => (a.order || 0) - (b.order || 0)).map((lesson) => (
                                            <div key={lesson.id} className="flex items-center justify-between px-8 py-5 rounded-[1.5rem] bg-transparent hover:bg-background hover:shadow-xl hover:shadow-black/5 transition-all group/lesson">
                                                <div className="flex items-center gap-5">
                                                    <div className="p-3 bg-muted rounded-2xl group-hover/lesson:bg-primary/10 group-hover/lesson:text-primary transition-colors">
                                                        {lesson.type === 'VIDEO' ? <PlayCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                                    </div>
                                                    <span className="font-bold text-lg text-zinc-600 group-hover/lesson:text-zinc-900 transition-colors">{lesson.title}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-black text-muted-foreground tabular-nums">{lesson.duration}m</span>
                                                    {mIdx < 2 ? (
                                                        <Button variant="ghost" size="sm" onClick={onStartLearning} className="hover:bg-primary/10 hover:text-primary rounded-xl font-black text-[10px] items-center gap-2">
                                                            Preview <ChevronRight className="h-3 w-3" />
                                                        </Button>
                                                    ) : (
                                                        <Lock className="h-4 w-4 text-zinc-300" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="space-y-10">
                    {/* Fast Stats */}
                    <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.05)] border border-slate-100 space-y-10 sticky top-24">
                        <div className="space-y-8">
                            <h3 className="text-3xl font-black tracking-tight text-zinc-900">High-Level Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                                    <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center shadow-sm border border-slate-100">
                                        <PlayCircle className="h-7 w-7 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-none mb-1">Curriculum</p>
                                        <p className="text-xl font-black tabular-nums text-zinc-900">{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Units</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                                    <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center shadow-sm border border-slate-100">
                                        <Users className="h-7 w-7 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-none mb-1">Enrolled</p>
                                        <p className="text-xl font-black tabular-nums text-zinc-900">{course._count.enrollments || 0}+ students</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                                    <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center shadow-sm border border-slate-100">
                                        <Clock className="h-7 w-7 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-none mb-1">Last Update</p>
                                        <p className="text-xl font-black text-zinc-900">{new Date(course.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructor Details */}
                        {course.instructor && (
                            <div className="pt-10 border-t border-slate-100 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black tracking-tight text-zinc-900">Lead Mentor</h3>
                                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[8px] font-black uppercase tracking-widest border border-primary/20">Verified Expert</div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="h-24 w-24 rounded-[2rem] overflow-hidden border border-slate-200 shadow-lg p-1 bg-white">
                                        <img
                                            src={course.instructor.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200"}
                                            alt={course.instructor.name}
                                            className="w-full h-full object-cover rounded-[1.5rem]"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-zinc-950">{course.instructor.name}</h4>
                                        <p className="text-xs font-black text-primary uppercase tracking-[0.2em] leading-none mt-2">Principal Engineering Manager</p>
                                        <div className="flex gap-2 mt-4 text-[10px] text-zinc-400 font-bold">
                                            <span>{course._count.enrollments || 0}+ Mentored</span>
                                            <span>•</span>
                                            <span>10+ Years Exp</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <p className="text-zinc-500 leading-relaxed font-semibold text-sm italic pl-6 border-l-4 border-primary/20">
                                        &ldquo;{course.instructor.bio || "Dedicated to empowering students through high-quality education and mentorship."}&rdquo;
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            {isEnrolled ? (
                                <Button size="lg" onClick={onStartLearning} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white h-20 rounded-[1.5rem] text-2xl font-black shadow-xl transition-all">
                                    Open Player
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <Button size="lg" onClick={handleEnroll} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-20 rounded-[1.5rem] text-2xl font-black shadow-xl shadow-primary/20 transition-all">
                                        Enroll Now
                                    </Button>
                                    <Button variant="outline" size="lg" onClick={onStartLearning} className="w-full border-slate-200 bg-white hover:bg-slate-50 text-zinc-950 h-20 rounded-[1.5rem] text-2xl font-black shadow-sm transition-all">
                                        Free Preview
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {course.brochureUrl && (
                        <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 space-y-6">
                            <h4 className="text-xl font-black tracking-tight">Need more details?</h4>
                            <p className="text-sm font-bold text-zinc-500 leading-relaxed">Download our detailed course brochure to learn about the outcomes, tools, and certifications.</p>
                            <Button variant="default" asChild className="w-full bg-primary hover:bg-primary/90 text-white font-black h-16 rounded-3xl">
                                <a href={course.brochureUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-5 w-5" />
                                    Download Brochure
                                </a>
                            </Button>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
};

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
    const [showPlayer, setShowPlayer] = useState(false);

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

    if (!showPlayer) {
        return (
            <>
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-50 sticky top-0 shadow-sm backdrop-blur-md bg-white/80">
                    <div className="flex items-center gap-4">
                        <Link href="/courses" className="text-slate-400 hover:text-zinc-900 transition-colors bg-slate-50 p-2 rounded-2xl border border-slate-100 group">
                            <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/" className="font-black text-2xl tracking-tighter text-zinc-900">SHORAJ</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {isEnrolled ? (
                            <Button onClick={() => setShowPlayer(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white font-black rounded-2xl px-8 shadow-lg">
                                Start Learning
                            </Button>
                        ) : (
                            <Button onClick={handleEnroll} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl px-8 shadow-lg shadow-primary/20">
                                Enroll Now
                            </Button>
                        )}
                    </div>
                </header>
                <CourseLandingView
                    course={course}
                    onStartLearning={() => setShowPlayer(true)}
                    handleEnroll={handleEnroll}
                    isEnrolled={isEnrolled}
                />
                <EnrollmentModal
                    isOpen={isEnrollmentModalOpen}
                    onClose={() => setIsEnrollmentModalOpen(false)}
                    onSuccess={() => setIsEnrolled(true)}
                    course={course}
                />
            </>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="h-14 bg-zinc-900 border-b border-zinc-800 text-white flex items-center justify-between px-4 shrink-0 z-20 shadow-md">
                <div className="flex items-center gap-4 overflow-hidden">
                    <button onClick={() => setShowPlayer(false)} className="text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
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
                    <button onClick={() => setShowPlayer(false)} className="hidden md:flex items-center gap-2 mr-4 text-sm text-zinc-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer">
                        Exit Player
                    </button>
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
