
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Loader2, ChevronRight, BookOpen, Video, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateCoursePage() {
    const { token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // New State for Course Format
    const [courseType, setCourseType] = useState<"VIDEO" | "LIVE">("VIDEO");

    // Separate state to prevent data leakage between types
    const [videoData, setVideoData] = useState({
        title: "",
        description: "",
        level: "BEGINNER",
        price: 0,
        isPublished: true,
    });

    const [liveData, setLiveData] = useState({
        title: "",
        description: "",
        level: "BEGINNER",
        price: 0,
        isPublished: true,
        meetingPlatform: "ZOOM" as "ZOOM" | "MEET",
        meetingLink: "",
        schedule: ""
    });

    // Computed properties for cleaner JSX
    const formData = courseType === "VIDEO" ? videoData : liveData;
    const setFormData = (newData: any) => {
        if (courseType === "VIDEO") {
            setVideoData(newData);
        } else {
            setLiveData(newData);
        }
    };

    const handleSubmit = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const payload = {
                ...formData,
                type: courseType
            };

            const response = await api.post('/courses', payload, token);
            // Redirect to the "Curriculum Editor"
            router.push(`/instructor/courses/${response.id}/edit`);
        } catch (error) {
            alert("Failed to create course. Ensure you are an Instructor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Wizard Progress */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Course</h1>
                    <p className="text-muted-foreground mt-1">Step 1: Course Basics</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground hidden md:flex">
                    <span className="text-primary font-semibold">Basics</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>Curriculum</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>Media</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>Pricing</span>
                </div>
            </div>

            {/* Course Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    onClick={() => setCourseType("VIDEO")}
                    className={cn(
                        "cursor-pointer p-6 rounded-xl border-2 transition-all flex items-center gap-4",
                        courseType === "VIDEO"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/50 bg-card"
                    )}
                >
                    <div className={cn("p-3 rounded-full", courseType === "VIDEO" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <Video className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Pre-recorded Course</h3>
                        <p className="text-sm text-muted-foreground">Self-paced video lessons with quizzes.</p>
                    </div>
                </div>

                <div
                    onClick={() => setCourseType("LIVE")}
                    className={cn(
                        "cursor-pointer p-6 rounded-xl border-2 transition-all flex items-center gap-4",
                        courseType === "LIVE"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/50 bg-card"
                    )}
                >
                    <div className={cn("p-3 rounded-full", courseType === "LIVE" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Live Classes</h3>
                        <p className="text-sm text-muted-foreground">Interactive live classes via Zoom/Meet.</p>
                    </div>
                </div>
            </div>

            <Card className="shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Course Information</CardTitle>
                            <CardDescription>Tell students what they will learn.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Course Title</Label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder={courseType === "VIDEO" ? "e.g. Master ReactJS in 30 Days" : "e.g. Full Stack Live Class Batch 5"}
                            className="text-lg py-6"
                        />
                        <p className="text-xs text-muted-foreground">
                            Catchy titles get more clicks. Keep it under 60 characters.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what students will achieve..."
                            className="min-h-[150px]"
                        />
                    </div>

                    {courseType === "LIVE" && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-primary font-medium mb-2">
                                <Calendar className="h-4 w-4" /> Live Class Settings
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Meeting Platform</Label>
                                    <Select
                                        value={(formData as typeof liveData).meetingPlatform}
                                        onValueChange={(val: "ZOOM" | "MEET") => setFormData({ ...formData, meetingPlatform: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ZOOM">Zoom Meeting</SelectItem>
                                            <SelectItem value="MEET">Google Meet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Meeting Link</Label>
                                    <Input
                                        value={(formData as typeof liveData).meetingLink || ""}
                                        onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                        placeholder="Paste your recurring meeting link here"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Schedule Note</Label>
                                    <Input
                                        value={(formData as typeof liveData).schedule}
                                        onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                                        placeholder="e.g. Mon, Wed, Fri at 8 PM IST"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Difficulty Level</Label>
                            <Select
                                value={formData.level}
                                onValueChange={(val) => setFormData({ ...formData, level: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BEGINNER">Beginner (No experience)</SelectItem>
                                    <SelectItem value="INTERMEDIATE">Intermediate (Basic knowledge)</SelectItem>
                                    <SelectItem value="ADVANCED">Advanced (Deep dive)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Price moved to "Pricing" step later in wizards */}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="min-w-[150px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                Save & Continue <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
