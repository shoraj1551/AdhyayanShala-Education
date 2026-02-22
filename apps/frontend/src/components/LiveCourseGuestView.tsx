import React, { useState } from "react";
import { CourseContent } from "@/app/(dashboard)/courses/[id]/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Calendar, FileText, Download, Play, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import { StudentScheduleView } from "@/components/StudentScheduleView";
import { Badge } from "@/components/ui/badge";

interface Props {
    course: CourseContent;
    handleEnroll: () => void;
}

export function LiveCourseGuestView({ course, handleEnroll }: Props) {
    const [demoForm, setDemoForm] = useState({ name: '', email: '', phone: '' });
    const [submittingDemo, setSubmittingDemo] = useState(false);

    const handleDemoRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingDemo(true);
        try {
            await api.post('/public/contact/inquiry', {
                name: demoForm.name,
                email: demoForm.email,
                phone: demoForm.phone,
                subject: `Demo Request: ${course.title}`,
                message: `User requested a demo for LIVE course: ${course.title} (ID: ${course.id})`,
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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col">
            {/* Simple Top Navigation */}
            <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-bold text-xl text-primary hover:opacity-80 transition-opacity">
                        SHORAJ
                    </Link>
                    <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />
                    <h1 className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-md hidden sm:block">
                        {course.title}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="hidden sm:flex text-zinc-600 dark:text-zinc-400">
                        <Link href="/courses">All Courses</Link>
                    </Button>
                    <Button variant="default" onClick={handleEnroll}>
                        Enroll Now
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Course Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Section */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="default" className="bg-red-500 hover:bg-red-600">LIVE CLASS</Badge>
                            {course.isFree && <Badge variant="secondary" className="bg-green-100 text-green-800 border-transparent">FREE</Badge>}
                        </div>
                        <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">
                            {course.title}
                        </h2>

                        {course.instructor && (
                            <div className="flex items-center gap-3 mt-4 text-zinc-600 dark:text-zinc-400">
                                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                                    {course.instructor.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Instructor</p>
                                    <p className="text-sm">{course.instructor.name}</p>
                                </div>
                            </div>
                        )}

                        <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 mt-6 text-lg leading-relaxed">
                            {course.description || "No description provided for this course."}
                        </div>
                    </div>

                    <hr className="border-zinc-200 dark:border-zinc-800" />

                    {/* Schedule Section */}
                    <div className="pt-2">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                            <Calendar className="h-6 w-6 text-primary" /> Class Schedule
                        </h3>
                        <StudentScheduleView courseId={course.id} isEnrolled={false} />
                    </div>

                    {/* Brochure Section */}
                    {course.brochureUrl && (
                        <>
                            <hr className="border-zinc-200 dark:border-zinc-800" />
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                        <FileText className="h-6 w-6 text-primary" /> Course Brochure
                                    </h3>
                                    <Button variant="outline" asChild className="gap-2 border-zinc-300 dark:border-zinc-700">
                                        <a href={course.brochureUrl} download target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" /> Download PDF
                                        </a>
                                    </Button>
                                </div>

                                <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[600px] shadow-sm bg-zinc-100 dark:bg-zinc-900">
                                    {course.brochureUrl.toLowerCase().endsWith('.pdf') ? (
                                        <object
                                            data={course.brochureUrl}
                                            type="application/pdf"
                                            className="w-full h-full"
                                        >
                                            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                                <FileText className="h-16 w-16 mb-4 opacity-50" />
                                                <p>Your browser doesn&apos;t support inline PDFs.</p>
                                                <a href={course.brochureUrl} className="text-primary hover:underline mt-2">Download it here to view.</a>
                                            </div>
                                        </object>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={course.brochureUrl}
                                                alt="Course Brochure"
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column: Sticky Demo Request Form */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
                        {/* Highlights */}
                        <div className="space-y-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                                    {course.isFree ? "Free" : course.discountedPrice ? `₹${course.discountedPrice.toLocaleString()}` : `₹${course.price.toLocaleString()}`}
                                </span>
                                {course.discountedPrice && course.price > course.discountedPrice && (
                                    <span className="text-lg line-through text-zinc-400">₹{course.price.toLocaleString()}</span>
                                )}
                            </div>
                            <Button size="lg" className="w-full text-lg font-bold" onClick={handleEnroll}>
                                {course.isFree ? "Enroll for Free" : "Enroll Now"}
                            </Button>

                            <ul className="space-y-3 pt-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                <li className="flex items-center gap-2"><Play className="h-4 w-4 text-emerald-500" /> Interactive Live Sessions</li>
                                <li className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-emerald-500" /> Live Q&A and Doubt Solving</li>
                                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Certificate of Completion</li>
                            </ul>
                        </div>

                        {/* Demo Form */}
                        <div>
                            <div className="mb-4">
                                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Request a Free Demo</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Not sure yet? Get a free callback and demo from the instructor.</p>
                            </div>
                            <form onSubmit={handleDemoRequest} className="space-y-4">
                                <div>
                                    <Input
                                        required
                                        placeholder="Full Name"
                                        className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                                        value={demoForm.name}
                                        onChange={e => setDemoForm({ ...demoForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Input
                                        required
                                        type="email"
                                        placeholder="Email Address"
                                        className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                                        value={demoForm.email}
                                        onChange={e => setDemoForm({ ...demoForm, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="tel"
                                        placeholder="Phone Number (Optional)"
                                        className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                                        value={demoForm.phone}
                                        onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" disabled={submittingDemo} className="w-full bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-200 dark:hover:bg-white dark:text-zinc-900 text-white font-bold tracking-wide">
                                    {submittingDemo ? "Submitting..." : "Get a Callback"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
