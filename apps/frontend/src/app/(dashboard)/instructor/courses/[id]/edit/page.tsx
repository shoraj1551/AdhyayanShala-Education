
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, Trash, FileText, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface Lesson {
    id: string;
    title: string;
    type: 'VIDEO' | 'TEXT';
    content: string;
    order: number;
}

interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

export default function CourseEditorPage() {
    const { token } = useAuth();
    const params = useParams();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // UI States
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");

    const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<string | null>(null);
    const [newLessonData, setNewLessonData] = useState({ title: "", type: "VIDEO" as "VIDEO" | "TEXT", content: "" });

    const fetchCourse = () => {
        if (token && params.id) {
            api.get(`/courses/${params.id}`, token)
                .then(setCourse)
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [token, params.id]);

    const handleAddModule = async () => {
        if (!newModuleTitle.trim()) return;
        try {
            await api.post(`/courses/${params.id}/modules`, { title: newModuleTitle }, token);
            setNewModuleTitle("");
            setIsAddingModule(false);
            fetchCourse();
        } catch (error) {
            alert("Failed to add module");
        }
    };

    const handleAddLesson = async (moduleId: string) => {
        if (!newLessonData.title.trim()) return;
        try {
            // Updated route structure based on previous backend changes
            // router.post('/courses/modules/:moduleId/lessons' ...
            // In routes.ts: router.post('/modules/:moduleId/lessons', ...)
            await api.post(`/courses/modules/${moduleId}/lessons`, newLessonData, token);

            setAddingLessonToModuleId(null);
            setNewLessonData({ title: "", type: "VIDEO", content: "" });
            fetchCourse();
        } catch (error) {
            console.error(error);
            alert("Failed to add lesson");
        }
    };

    if (loading) return <div className="p-8">Loading editor...</div>;
    if (!course) return <div className="p-8">Course not found.</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-muted-foreground">Course Content Editor</p>
                </div>
                <Button variant="outline" onClick={() => window.open(`/courses/${params.id}`, '_blank')}>
                    Preview Course
                </Button>
            </div>

            <div className="space-y-6">
                {course.modules?.map((module: Module) => (
                    <Card key={module.id} className="relative overflow-hidden">
                        <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Module: {module.title}</h3>
                            <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0"><Trash className="h-4 w-4" /></Button>
                        </div>
                        <CardContent className="p-4 space-y-4">
                            {module.lessons?.length === 0 && <p className="text-sm text-muted-foreground italic">No lessons in this module.</p>}

                            <div className="space-y-2">
                                {module.lessons?.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center gap-3 p-3 bg-card border rounded hover:bg-accent/50 transition-colors">
                                        <div className="p-2 bg-primary/10 rounded text-primary">
                                            {lesson.type === 'VIDEO' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{lesson.title}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{lesson.content || "No content"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Lesson Form */}
                            {addingLessonToModuleId === module.id ? (
                                <div className="bg-muted/20 p-4 rounded border space-y-3 mt-4">
                                    <h4 className="font-medium text-sm">New Lesson</h4>
                                    <Input
                                        placeholder="Lesson Title"
                                        value={newLessonData.title}
                                        onChange={e => setNewLessonData({ ...newLessonData, title: e.target.value })}
                                    />
                                    <div className="flex gap-4">
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={newLessonData.type}
                                            onChange={e => setNewLessonData({ ...newLessonData, type: e.target.value as "VIDEO" | "TEXT" })}
                                        >
                                            <option value="VIDEO">Video URL</option>
                                            <option value="TEXT">Text Content</option>
                                        </select>
                                    </div>
                                    {newLessonData.type === 'VIDEO' ? (
                                        <Input
                                            placeholder="YouTube/Vimeo URL"
                                            value={newLessonData.content}
                                            onChange={e => setNewLessonData({ ...newLessonData, content: e.target.value })}
                                        />
                                    ) : (
                                        <Textarea
                                            placeholder="Lesson content logic explanation..."
                                            value={newLessonData.content}
                                            onChange={e => setNewLessonData({ ...newLessonData, content: e.target.value })}
                                        />
                                    )}
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="ghost" size="sm" onClick={() => setAddingLessonToModuleId(null)}>Cancel</Button>
                                        <Button size="sm" onClick={() => handleAddLesson(module.id)}>Add Lesson</Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full mt-2 border-dashed"
                                    onClick={() => setAddingLessonToModuleId(module.id)}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Lesson
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {/* Add Module Wrapper */}
                {isAddingModule ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-bold">Add New Module</h3>
                            <Input
                                placeholder="Module Title (e.g., Introduction to Physics)"
                                value={newModuleTitle}
                                onChange={e => setNewModuleTitle(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" onClick={() => setIsAddingModule(false)}>Cancel</Button>
                                <Button onClick={handleAddModule}>Save Module</Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Button size="lg" className="w-full h-16 text-lg" onClick={() => setIsAddingModule(true)}>
                        <Plus className="mr-2 h-5 w-5" /> Add Module
                    </Button>
                )}
            </div>
        </div>
    );
}
