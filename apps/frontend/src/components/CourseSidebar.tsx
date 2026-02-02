
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Circle, Lock, PlayCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseSidebarProps {
    course: any;
    currentLessonId?: string;
    onSelectLesson: (lesson: any) => void;
    completedLessonIds?: string[];
}

export function CourseSidebar({ course, currentLessonId, onSelectLesson, completedLessonIds = [] }: CourseSidebarProps) {
    return (
        <div className="h-full border-r bg-card overflow-y-auto">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg line-clamp-1">{course.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {Math.round((completedLessonIds.length / (course.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0) || 1)) * 100)}% Complete
                    </span>
                    <span>{course.modules.length} Modules</span>
                </div>
            </div>

            <Accordion type="multiple" defaultValue={course.modules.map((m: any) => m.id)} className="w-full">
                {course.modules.map((module: any, index: number) => (
                    <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                            <div className="flex flex-col items-start text-left">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Module {index + 1}
                                </span>
                                <span className="font-medium text-sm line-clamp-1">{module.title}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-0 pb-0">
                            <div className="flex flex-col">
                                {module.lessons.map((lesson: any) => {
                                    const isCompleted = completedLessonIds.includes(lesson.id);
                                    const isActive = currentLessonId === lesson.id;

                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => onSelectLesson(lesson)}
                                            className={cn(
                                                "flex items-start gap-3 px-4 py-3 text-sm transition-colors border-l-2",
                                                isActive
                                                    ? "bg-primary/5 border-primary text-primary"
                                                    : "border-transparent hover:bg-muted/50 text-foreground/80",
                                                isCompleted && !isActive && "text-muted-foreground"
                                            )}
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                {isCompleted ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : isActive ? (
                                                    <PlayCircle className="h-4 w-4 fill-primary/20" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-muted-foreground/40" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className={cn("line-clamp-2", isCompleted && "line-through decoration-muted-foreground/50 opacity-80")}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                                                    {lesson.type === 'VIDEO' ? (
                                                        <span className="flex items-center gap-1"><PlayCircle className="h-3 w-3" /> Video</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Reading</span>
                                                    )}
                                                    {lesson.duration && <span>• {lesson.duration} min</span>}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {/* Tests Placeholder */}
                                {module.tests?.length > 0 && (
                                    <div className="bg-amber-500/5 px-4 py-2 text-xs text-amber-600 font-medium">
                                        {module.tests.length} Quiz{module.tests.length > 1 ? 'zes' : ''} available
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
