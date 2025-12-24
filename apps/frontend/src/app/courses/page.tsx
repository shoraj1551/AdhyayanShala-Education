import Link from 'next/link';
import { getCourses } from '@/lib/api';

export default async function CoursesPage() {
    const courses = await getCourses();

    return (
        <div className="section-spacing container-narrow min-h-screen">
            <div className="mb-12">
                <h1 className="text-3xl font-medium mb-4">Courses</h1>
                <p className="text-muted-foreground text-lg">
                    Master the fundamentals of Data Science and Mathematics.
                </p>
            </div>

            <div className="space-y-6">
                {courses.map((course) => (
                    <div key={course.id} className="block group">
                        <Link href={`/courses/${course.id}`} className="block p-6 border border-border rounded-sm hover:border-foreground transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1 block">
                                        {course.level}
                                    </span>
                                    <h2 className="text-xl font-medium group-hover:text-accent transition-colors">
                                        {course.title}
                                    </h2>
                                </div>
                                {course.price === 0 ? (
                                    <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">Free</span>
                                ) : (
                                    <span className="text-sm font-medium">${course.price}</span>
                                )}
                            </div>
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                                {course.description}
                            </p>
                            <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors flex items-center">
                                View Course <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </Link>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No courses available yet.
                    </div>
                )}
            </div>
        </div>
    );
}
