
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, Trash, FileText, Video, Upload, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LiveClassSettingsForm } from "@/components/LiveClassSettingsForm";

interface Lesson {
    id: string;
    title: string;
    type: 'VIDEO' | 'TEXT';
    content: string;
    videoUrl?: string;
    summary?: string;
    attachmentUrl?: string;
    order: number;
    createdAt?: string; // useful for sorting if order is same
}

interface Test {
    id: string;
    title: string;
    duration: number;
    moduleId?: string;
    order: number;
}

interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
    tests?: Test[];
}

export default function CourseEditorPage() {
    const { token } = useAuth();
    const params = useParams();
    const router = useRouter();  // Added missing navigation hook
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // UI States
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");

    const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<string | null>(null);

    // Updated state for new optional fields
    const [newLessonData, setNewLessonData] = useState({
        title: "",
        type: "VIDEO" as "VIDEO" | "TEXT",
        content: "", // Legacy field, kept for compatibility
        videoUrl: "",
        summary: "",
        attachmentUrl: ""
    });

    const [uploading, setUploading] = useState(false);

    // Test Creation State
    const [addingTestToModuleId, setAddingTestToModuleId] = useState<string | null>(null);
    const [newTestData, setNewTestData] = useState({ title: "", duration: 60 });

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
            await api.post(`/courses/${params.id}/modules`, { title: newModuleTitle }, token ?? undefined);
            setNewModuleTitle("");
            setIsAddingModule(false);
            fetchCourse();
        } catch (error) {
            alert("Failed to add module");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'videoUrl' | 'attachmentUrl') => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setUploading(true);
        try {
            const result = await api.upload(file, token ?? undefined);
            // Result is { url: string, filename: string }
            setNewLessonData(prev => ({ ...prev, [field]: result.url }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Ensure backend is running.");
        } finally {
            setUploading(false);
        }
    };

    const handleAddTest = async (moduleId: string) => {
        if (!newTestData.title.trim()) return;
        try {
            const module = course.modules.find((m: any) => m.id === moduleId);
            const currentCount = (module?.lessons?.length || 0) + (module?.tests?.length || 0);

            await api.post('/tests', {
                title: newTestData.title,
                duration: Number(newTestData.duration),
                courseId: course.id,
                moduleId: moduleId,
                order: currentCount
            }, token ?? undefined);

            setAddingTestToModuleId(null);
            setNewTestData({ title: "", duration: 60 });
            alert("Test created! Questions can be added later.");
            fetchCourse();
        } catch (error) {
            console.error(error);
            alert("Failed to add test");
        }
    };

    const handleAddLesson = async (moduleId: string) => {
        if (!newLessonData.title.trim()) return;
        try {
            // Send all new optional fields
            await api.post(`/courses/modules/${moduleId}/lessons`, {
                ...newLessonData,
                type: newLessonData.videoUrl ? "VIDEO" : "TEXT"
            }, token ?? undefined);

            setAddingLessonToModuleId(null);
            // Reset form
            setNewLessonData({
                title: "",
                type: "VIDEO",
                content: "",
                videoUrl: "",
                summary: "",
                attachmentUrl: ""
            });
            fetchCourse();
        } catch (error) {
            console.error(error);
            alert("Failed to add lesson");
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Are you sure you want to delete this module? All lessons and tests within it will be deleted.")) return;
        try {
            await api.delete(`/courses/modules/${moduleId}`, token ?? undefined);
            fetchCourse();
        } catch (error) {
            console.error(error);
            alert("Failed to delete module");
        }
    };

    // --- DELETE COURSE LOGIC ---
    // --- ACTION VERIFICATION LOGIC (DELETE / UNPUBLISH) ---
    const [showVerifyDialog, setShowVerifyDialog] = useState(false);
    const [actionType, setActionType] = useState<'DELETE' | 'UNPUBLISH' | null>(null);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const handleRequestOtp = async () => {
        try {
            await api.post(`/courses/${course.id}/delete-otp`, {}, token ?? undefined);
            setOtpSent(true);
            alert("OTP sent to your registered email (Check server console for demo).");
        } catch (error) {
            alert("Failed to send OTP.");
        }
    };

    const handleConfirmAction = async () => {
        if (!actionType) return;

        // Logic for Enrolled Courses (OTP Required checks)
        const hasEnrollments = (course._count?.enrollments || 0) > 0;

        if (hasEnrollments) {
            if (!otp) return alert("Please enter OTP (Required for enrolled courses)");
            if (!confirm("Are you sure? This action requires verification.")) return;
        }

        setActionLoading(true);
        try {
            if (actionType === 'DELETE') {
                await api.delete(`/courses/${course.id}`, { otp: otp }, token ?? undefined);
                alert("Course deleted successfully.");
                router.push('/instructor/courses');
            } else if (actionType === 'UNPUBLISH') {
                await api.post(`/courses/${course.id}/unpublish`, { otp: otp }, token ?? undefined);
                alert("Course Unpublished.");
                setShowVerifyDialog(false);
                fetchCourse();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || `Failed to ${actionType.toLowerCase()} course.`);
        } finally {
            setActionLoading(false);
            setOtp("");
            setOtpSent(false); // Reset for next time
        }
    };

    const initiateAction = (type: 'DELETE' | 'UNPUBLISH') => {
        setActionType(type);
        const hasEnrollments = (course._count?.enrollments || 0) > 0;

        // If no enrollments, we can maybe prompt differently or just use the same dialog for consistency?
        // Let's use the dialog but it will show "Delete Immediately" option.
        setShowVerifyDialog(true);
    };

    if (loading) return <div className="p-8">Loading editor...</div>;
    if (!course) return <div className="p-8">Course not found.</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-muted-foreground">Course Content Editor {course.isPublished && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded ml-2">Published</span>}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.open(`/courses/${params.id}`, '_blank')}>
                        Preview Course
                    </Button>
                    {!course.isPublished ? (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={async () => {
                                if (!confirm("Are you sure? This will make the course public and announce it to all users.")) return;
                                try {
                                    await api.post(`/courses/${course.id}/publish`, {}, token ?? undefined);
                                    alert("Course Published Successfully!");
                                    fetchCourse();
                                } catch (e) {
                                    alert("Failed to publish");
                                }
                            }}
                        >
                            Publish Course
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
                            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
                            onClick={() => initiateAction('UNPUBLISH')}
                        >
                            Unpublish
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-6">

                {/* Pricing Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>💰 Pricing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {course.type === 'VIDEO' ? (
                            <div>
                                <Label>Course Price</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-primary">₹{course.price || 0}</span>
                                    <span className="text-sm text-muted-foreground">One-time payment</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Start Date</Label>
                                        <Input
                                            type="text"
                                            value={course.startDate ? new Date(course.startDate).toLocaleDateString() : 'Not set'}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                    <div>
                                        <Label>End Date</Label>
                                        <Input
                                            type="text"
                                            value={course.endDate ? new Date(course.endDate).toLocaleDateString() : 'Not set'}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label>Total Classes</Label>
                                        <Input value={course.totalClasses || 0} disabled className="bg-muted" />
                                    </div>
                                    <div>
                                        <Label>Price Per Class</Label>
                                        <Input value={`₹${course.pricePerClass || 0}`} disabled className="bg-muted" />
                                    </div>
                                    <div>
                                        <Label>Total Price</Label>
                                        <Input value={`₹${course.price || 0}`} disabled className="bg-muted" />
                                    </div>
                                </div>
                                {course.discountedPrice && course.discountedPrice < course.price && (
                                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-green-700 dark:text-green-300">Discounted Price</p>
                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{course.discountedPrice}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-green-600 dark:text-green-400">You save</p>
                                                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                                                    ₹{course.price - course.discountedPrice}
                                                </p>
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                    ({Math.round(((course.price - course.discountedPrice) / course.price) * 100)}% OFF)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Live Class Settings */}
                <div className="mb-8">
                    <LiveClassSettingsForm courseId={course.id} />
                </div>

                {course.modules?.map((module: Module) => (
                    <Card key={module.id} className="relative overflow-hidden">
                        <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Module: {module.title}</h3>
                            <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => handleDeleteModule(module.id)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardContent className="p-4 space-y-4">
                            {module.lessons?.length === 0 && <p className="text-sm text-muted-foreground italic">No lessons in this module.</p>}

                            <div className="space-y-2">
                                {[
                                    ...(module.lessons || []).map(l => ({ ...l, kind: 'LESSON' })),
                                    ...(module.tests || []).map(t => ({ ...t, kind: 'TEST' }))
                                ].sort((a: any, b: any) => a.order - b.order).map((item: any) => (
                                    <div key={`${item.kind}-${item.id}`} className="flex items-center gap-3 p-3 bg-card border rounded hover:bg-accent/50 transition-colors">
                                        <div className={cn("p-2 rounded", item.kind === 'TEST' ? "bg-purple-100 text-purple-600" : "bg-primary/10 text-primary")}>
                                            {item.kind === 'TEST' ? (
                                                <FileText className="h-4 w-4" />
                                            ) : (
                                                item.type === 'VIDEO' || item.videoUrl ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{item.title}</p>
                                                {item.kind === 'TEST' && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">TEST</span>}
                                            </div>
                                            {item.kind === 'LESSON' && (
                                                <div className="flex gap-2 text-xs text-muted-foreground">
                                                    {item.videoUrl && <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Video</span>}
                                                    {item.attachmentUrl && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> PDF</span>}
                                                </div>
                                            )}
                                            {item.kind === 'TEST' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-6 text-xs mt-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                                                    onClick={() => router.push(`/instructor/tests/${item.id}`)}
                                                >
                                                    Edit Questions
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Lesson Form */}
                            {addingLessonToModuleId === module.id && (
                                <div className="bg-muted/20 p-4 rounded border space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="font-medium text-sm">New Lesson Details</h4>

                                    <div className="space-y-2">
                                        <Label>Lesson Title</Label>
                                        <Input
                                            placeholder="e.g. Introduction to Derivatives"
                                            value={newLessonData.title}
                                            onChange={e => setNewLessonData({ ...newLessonData, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Video Resource <span className="text-muted-foreground text-xs">(External URL or Upload)</span></Label>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Video className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="https://youtube.com/..."
                                                    value={newLessonData.videoUrl || ""}
                                                    onChange={e => setNewLessonData({ ...newLessonData, videoUrl: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id={`video-upload-${module.id}`}
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, 'videoUrl')}
                                                />
                                                <Button size="sm" variant="outline" className="w-full" onClick={() => document.getElementById(`video-upload-${module.id}`)?.click()} disabled={uploading}>
                                                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                    Upload Video from Device
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Text Summary / Content <span className="text-muted-foreground text-xs">(Optional - Supports LaTeX via $$...$$)</span></Label>
                                        <Textarea
                                            placeholder="Summarize the lesson or write full content. Use $$x^2$$ for math."
                                            value={newLessonData.summary || ""}
                                            onChange={e => setNewLessonData({ ...newLessonData, summary: e.target.value })}
                                            className="min-h-[100px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Attachment <span className="text-muted-foreground text-xs">(External URL or Upload PDF/Doc)</span></Label>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="https://drive.google.com/... (PDF/Doc)"
                                                    value={newLessonData.attachmentUrl || ""}
                                                    onChange={e => setNewLessonData({ ...newLessonData, attachmentUrl: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id={`doc-upload-${module.id}`}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.txt"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, 'attachmentUrl')}
                                                />
                                                <Button size="sm" variant="outline" className="w-full" onClick={() => document.getElementById(`doc-upload-${module.id}`)?.click()} disabled={uploading}>
                                                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                    Upload Document from Device
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button variant="ghost" size="sm" onClick={() => setAddingLessonToModuleId(null)}>Cancel</Button>
                                        <Button size="sm" onClick={() => handleAddLesson(module.id)}>Save Lesson</Button>
                                    </div>
                                </div>
                            )}

                            {addingTestToModuleId === module.id && (
                                <div className="bg-purple-50/50 p-4 rounded border border-purple-100 space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="font-medium text-sm text-purple-900">New Test Details</h4>

                                    <div className="space-y-2">
                                        <Label>Test Title</Label>
                                        <Input
                                            placeholder="e.g. Mid-Module Quiz"
                                            value={newTestData.title}
                                            onChange={e => setNewTestData({ ...newTestData, title: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Duration (minutes)</Label>
                                        <Input
                                            type="number"
                                            value={newTestData.duration}
                                            onChange={e => setNewTestData({ ...newTestData, duration: Number(e.target.value) })}
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button variant="ghost" size="sm" onClick={() => setAddingTestToModuleId(null)}>Cancel</Button>
                                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleAddTest(module.id)}>Create Test</Button>
                                    </div>
                                </div>
                            )}

                            {!addingLessonToModuleId && !addingTestToModuleId && (
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-dashed"
                                        onClick={() => setAddingLessonToModuleId(module.id)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add Lesson
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-dashed text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100"
                                        onClick={() => setAddingTestToModuleId(module.id)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add Test
                                    </Button>
                                </div>
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


            {/* DELETE COURSE SECTION */}
            <div className="border-t pt-8 mt-12 pb-8">
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-foreground">Delete this course</p>
                            <p className="text-sm text-muted-foreground">Once you delete a course, there is no going back. Please be certain.</p>
                        </div>
                        <Button variant="destructive" onClick={() => initiateAction('DELETE')}>Delete Course</Button>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType === 'DELETE' ? "Delete Course" : "Unpublish Course"}</DialogTitle>
                        <DialogDescription>
                            {actionType === 'DELETE'
                                ? "This action cannot be undone. This will permanently delete the course, all modules, lessons, and tests."
                                : "Unpublishing will hide this course from the catalog. Existing students may lose access unless re-published."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {(course._count?.enrollments || 0) > 0 ? (
                            <>
                                {!otpSent ? (
                                    <div className="text-center space-y-4">
                                        <p className="text-sm font-medium text-amber-600">This course has enrolled students. Verification required.</p>
                                        <p className="text-sm">To verify it's you, we need to send an OTP to your email.</p>
                                        <Button onClick={handleRequestOtp} className="w-full">Send OTP</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                                            OTP sent! Please check your email (or server console).
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Enter OTP</Label>
                                            <Input
                                                placeholder="6-digit code"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength={6}
                                                className="text-center text-lg tracking-widest"
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-4 bg-muted/50 rounded-lg text-center">
                                <p className="text-sm text-foreground mb-2">This course has <span className="font-bold">0 students</span> enrolled.</p>
                                <p className="text-xs text-muted-foreground">You can proceed immediately.</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowVerifyDialog(false)}>Cancel</Button>
                        {((course._count?.enrollments || 0) === 0 || otpSent) && (
                            <Button variant={actionType === 'DELETE' ? "destructive" : "default"} onClick={handleConfirmAction} disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (actionType === 'DELETE' ? <Trash className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />)}
                                {actionType === 'DELETE'
                                    ? ((course._count?.enrollments || 0) === 0 ? "Delete Immediately" : "Confirm Delete")
                                    : "Confirm Unpublish"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
