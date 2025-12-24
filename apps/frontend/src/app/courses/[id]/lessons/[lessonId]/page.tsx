import Link from 'next/link';
import { getCourse } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Course, Module, Lesson } from '@shoraj/shared';
import CompleteButton from '@/components/CompleteButton';

interface Props {
    params: Promise<{ id: string; lessonId: string }>;
}

export default async function LessonPage({ params }: Props) {
    const { id, lessonId } = await params;
    const course = await getCourse(id);

    if (!course) notFound();

    // Find current lesson and navigation
    let currentLesson: Lesson | undefined;
    let prevLesson: { id: string; title: string } | null = null;
    let nextLesson: { id: string; title: string } | null = null;

    const allLessons: Lesson[] = [];
    course.modules?.forEach(m => {
        m.lessons.forEach(l => allLessons.push(l));
    });

    const currentIndex = allLessons.findIndex(l => l.id === lessonId);

    if (currentIndex === -1) notFound();

    currentLesson = allLessons[currentIndex];
    if (currentIndex > 0) prevLesson = allLessons[currentIndex - 1];
    if (currentIndex < allLessons.length - 1) nextLesson = allLessons[currentIndex + 1];

    // Determine the next URL for the CompleteButton
    const nextLessonUrl = nextLesson ? `/courses/${id}/lessons/${nextLesson.id}` : undefined;

    return (
        <div className="flex min-h-screen">
            {/* SIDEBAR - Desktop Only for now */}
            <aside className="w-80 border-r border-border h-screen sticky top-0 overflow-y-auto hidden md:block bg-muted/5 p-6">
                <Link href={`/courses/${id}`} className="text-sm text-muted-foreground hover:text-foreground mb-6 block">
                    ← {course.title}
                </Link>
                <div className="space-y-6">
                    {course.modules?.map((module) => (
                        <div key={module.id} className="space-y-2">
                            <h3 className="font-medium text-sm tracking-wide uppercase text-muted-foreground">
                                {module.title}
                            </h3>
                            <div className="space-y-1 pl-2 border-l border-border">
                                {module.lessons?.map((lesson) => (
                                    <Link
                                        key={lesson.id}
                                        href={`/courses/${id}/lessons/${lesson.id}`}
                                        className={`block text-sm py-1.5 px-2 rounded -ml-px border-l-2 transition-colors ${lesson.id === lessonId ? 'border-foreground font-medium bg-muted/50' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {lesson.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 md:p-12 md:max-w-4xl max-w-full">
                <div className="mb-8">
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                        {currentLesson.type}
                    </span>
                    <h1 className="text-3xl font-medium mt-2">{currentLesson.title}</h1>
                </div>

                {/* CONTENT VIEWER */}
                <div className="prose prose-zinc max-w-none text-muted-foreground mb-12">
                    {currentLesson.type === 'VIDEO' ? (
                        <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white/50">
                            {/* Placeholder for real player */}
                            <div className="text-center">
                                <p>Video Player Placeholder</p>
                                <p className="text-xs mt-2">{currentLesson.content}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">
                            {currentLesson.content}
                        </div>
                    )}
                </div>

                {/* NAVIGATION & ACTIONS */}
                <div className="mt-12 border-t border-border pt-8 mt-auto">
                    <div className="flex justify-end mb-8">
                        <CompleteButton
                            lessonId={currentLesson.id}
                            nextLessonUrl={nextLessonUrl}
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        {prevLesson ? (
                            <Link href={`/courses/${id}/lessons/${prevLesson.id}`} className="text-foreground hover:text-muted-foreground transition-colors">
                                ← Previous: {prevLesson.title}
                            </Link>
                        ) : (
                            <div></div>
                        )}

                        {nextLesson ? (
                            <Link href={`/courses/${id}/lessons/${nextLesson.id}`} className="text-foreground hover:text-muted-foreground transition-colors">
                                Next: {nextLesson.title} →
                            </Link>
                        ) : (
                            <div className="opacity-50">End of Course</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
