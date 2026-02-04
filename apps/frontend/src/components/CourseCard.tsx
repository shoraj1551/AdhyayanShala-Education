import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, BookOpen, Trophy, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface EnrolledCourse {
    id: string;
    title: string;
    description: string;
    instructor: {
        id: string;
        name: string;
        email: string;
    };
    enrolledAt: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    type: string;
}

export function CourseCard({ course, isCompleted = false }: { course: EnrolledCourse; isCompleted?: boolean }) {
    return (
        <Card className="flex flex-col hover:shadow-lg transition-shadow border-t-4 border-t-transparent hover:border-t-primary">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                            by {course.instructor.name}
                        </CardDescription>
                    </div>
                    <Badge variant={course.type === 'LIVE' ? 'default' : 'secondary'}>
                        {course.type}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                </p>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className={isCompleted ? "bg-green-100 [&>div]:bg-green-600" : ""} />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                    </div>
                    {isCompleted && (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                            <Trophy className="h-4 w-4" />
                            <span>Certified</span>
                        </div>
                    )}
                </div>

                <Link href={`/courses/${course.id}`} className="mt-auto">
                    <Button
                        className="w-full gap-2"
                        variant={isCompleted ? "outline" : "default"}
                    >
                        {isCompleted ? (
                            <>
                                <RotateCcw className="h-4 w-4" />
                                Review Course
                            </>
                        ) : (
                            <>
                                <PlayCircle className="h-4 w-4" />
                                {course.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                            </>
                        )}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
