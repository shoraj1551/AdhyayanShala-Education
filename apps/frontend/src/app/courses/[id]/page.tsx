import Link from 'next/link';
import { getCourse } from '@/lib/api';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
    const { id } = await params;
    const course = await getCourse(id);

    if (!course) {
        notFound();
    }

    // @ts-ignore - tests not in shared interface yet but backend returns them
    const tests = course.tests || [];

    return (
        <div className="section-spacing container-narrow min-h-screen">
            <div className="mb-8">
                <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                    ← Back to Courses
                </Link>
                <span className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 mt-4">
                    {course.level}
                </span>
                <h1 className="text-3xl md:text-4xl font-medium mb-4 leading-tight">{course.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-prose">
                    {course.description}
                </p>
            </div>

            <div className="border-t border-border pt-8">
                <h2 className="text-xl font-medium mb-8">Course Curriculum</h2>

                <div className="space-y-8">
                    {course.modules?.map((module) => (
                        <div key={module.id} className="space-y-4">
                            <h3 className="font-medium text-lg text-foreground border-l-2 border-foreground pl-4">
                                {module.title}
                            </h3>
                            <div className="space-y-1 ml-4 md:ml-6">
                                {module.lessons?.map((lesson) => (
                                    <Link key={lesson.id} href={`/courses/${course.id}/lessons/${lesson.id}`} className="flex items-center p-3 hover:bg-muted/30 rounded transition-colors group cursor-pointer">
                                        <div className="mr-3 text-muted-foreground group-hover:text-foreground">
                                            {lesson.type === 'VIDEO' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            )}
                                        </div>
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                            {lesson.title}
                                        </span>
                                        {lesson.duration && (
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {lesson.duration} min
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* TESTS SECTION */}
                    {tests.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h3 className="font-medium text-lg text-foreground border-l-2 border-accent pl-4">
                                Assessments
                            </h3>
                            <div className="space-y-1 ml-4 md:ml-6">
                                {tests.map((test: any) => (
                                    <Link key={test.id} href={`/tests/${test.id}`} className="flex items-center p-3 hover:bg-muted/30 rounded transition-colors group cursor-pointer border border-border/50">
                                        <div className="mr-3 text-accent group-hover:text-foreground">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        </div>
                                        <span className="font-medium text-foreground transition-colors">
                                            {test.title}
                                        </span>
                                        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            Start Assessment
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <button className="bg-foreground text-background px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity">
                    Start Learning
                </button>
            </div>
        </div>
    );
}
