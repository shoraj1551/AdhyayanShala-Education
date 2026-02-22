
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
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Loader2, ChevronRight, BookOpen, Video, Users, Calendar, Clock, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateCoursePage() {
    const { token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // New State for Course Format
    const [courseType, setCourseType] = useState<"VIDEO" | "LIVE" | "TEST_SERIES">("VIDEO");

    // Visual schedule builder (LIVE only) — builds a schedule note string
    const [scheduleDays, setScheduleDays] = useState<number[]>([]);
    const [scheduleTime, setScheduleTime] = useState("20:00");

    const SCHED_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const fmt12h = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        const p = h >= 12 ? "PM" : "AM";
        return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${p}`;
    };

    const buildScheduleNote = (days: number[], time: string) =>
        days.length === 0 ? "" : `${days.map(d => SCHED_DAYS[d]).join(", ")} at ${fmt12h(time)} IST`;

    const toggleDay = (d: number) => {
        const next = scheduleDays.includes(d) ? scheduleDays.filter(x => x !== d) : [...scheduleDays, d];
        setScheduleDays(next);
        setFormData({ schedule: buildScheduleNote(next, scheduleTime) });
    };

    const onTimeChange = (t: string) => {
        setScheduleTime(t);
        setFormData({ schedule: buildScheduleNote(scheduleDays, t) });
    };

    // Separate state to prevent data leakage between types
    const [videoData, setVideoData] = useState({
        title: "",
        description: "",
        level: "BEGINNER",
        price: "" as number | string,
        isPublished: false,
        startDate: "",  // When the course becomes available (self-paced, no end date)
        thumbnailUrl: "",
        promoVideoUrl: "",
        brochureUrl: "",
        currency: "INR",
        isFree: false,
    });

    const [liveData, setLiveData] = useState({
        title: "",
        description: "",
        level: "BEGINNER",
        price: "" as number | string,
        pricePerClass: "" as number | string,
        discountedPrice: "" as number | string,
        totalClasses: "" as number | string,
        startDate: "",
        endDate: "",
        isPublished: false,
        meetingPlatform: "ZOOM" as "ZOOM" | "MEET",
        meetingLink: "",
        schedule: "",
        thumbnailUrl: "",
        promoVideoUrl: "",
        brochureUrl: "",
        currency: "INR",
        isFree: false,
    });

    const [testSeriesData, setTestSeriesData] = useState({
        title: "",
        description: "",
        level: "BEGINNER",
        price: "" as number | string,
        isPublished: false,
        startDate: "",
        thumbnailUrl: "",
        promoVideoUrl: "",
        brochureUrl: "",
        currency: "INR",
        isFree: false,
    });

    // Computed properties for cleaner JSX
    const formData = courseType === "VIDEO" ? videoData : (courseType === "LIVE" ? liveData : testSeriesData);
    const setFormData = (newData: Partial<typeof videoData> | Partial<typeof liveData> | Partial<typeof testSeriesData>) => {
        if (courseType === "VIDEO") {
            setVideoData(prev => ({ ...prev, ...newData } as typeof videoData));
        } else if (courseType === "LIVE") {
            setLiveData(prev => ({ ...prev, ...newData } as typeof liveData));
        } else {
            setTestSeriesData(prev => ({ ...prev, ...newData } as typeof testSeriesData));
        }
    };

    const [uploadingMedia, setUploadingMedia] = useState(false);

    const handleFileUpload = async (file: File, type: "thumbnailUrl" | "promoVideoUrl" | "brochureUrl") => {
        if (!token) return;
        setUploadingMedia(true);
        try {
            const res = await api.upload(file, token);
            setFormData({ ...formData, [type]: res.url });
        } catch (error) {
            console.error("Upload error", error);
            alert("Failed to upload file");
        } finally {
            setUploadingMedia(false);
        }
    };

    const handleSubmit = async () => {
        if (!token) {
            alert("You must be logged in to create a course");
            return;
        }

        // Validation for LIVE courses
        if (courseType === 'LIVE') {
            const live = formData as typeof liveData;
            if (!live.startDate || !live.endDate) {
                alert("Please set start and end dates for live classes");
                return;
            }
            if (!live.totalClasses || live.totalClasses === 0) {
                alert("Please enter the total number of classes");
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                price: Number(formData.price) || 0,
                ...(courseType === 'LIVE' ? {
                    pricePerClass: Number((formData as typeof liveData).pricePerClass) || 0,
                    discountedPrice: Number((formData as typeof liveData).discountedPrice) || 0,
                    totalClasses: Number((formData as typeof liveData).totalClasses) || 0,
                } : {}),
                type: courseType
            };

            console.log('[CREATE COURSE] Submitting:', payload);
            const response = await api.post('/courses', payload, token);
            console.log('[CREATE COURSE] Response:', response);

            // Redirect to the "Curriculum Editor"
            router.push(`/instructor/courses/${response.id}/edit`);
        } catch (error: unknown) {
            console.error('[CREATE COURSE] Error:', error);
            const err = error as Error & { response?: { data?: { message?: string } } };
            alert(`Failed to create course: ${err.response?.data?.message || err.message || 'Unknown error'}`);
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
                    <span className="text-primary font-semibold">Course Details</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>Curriculum</span>
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

                <div
                    onClick={() => setCourseType("TEST_SERIES")}
                    className={cn(
                        "cursor-pointer p-6 rounded-xl border-2 transition-all flex items-center gap-4 md:col-span-2 lg:col-span-1",
                        courseType === "TEST_SERIES"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/50 bg-card"
                    )}
                >
                    <div className={cn("p-3 rounded-full", courseType === "TEST_SERIES" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Test Series</h3>
                        <p className="text-sm text-muted-foreground">Bundle multiple tests into a comprehensive series.</p>
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
                                <div className="space-y-4 md:col-span-2">
                                    <Label className="flex items-center gap-1.5 font-semibold">
                                        <Clock className="h-4 w-4 text-primary" />
                                        Weekly Schedule
                                    </Label>

                                    {/* Day toggles */}
                                    <div className="flex gap-2 flex-wrap">
                                        {SCHED_DAYS.map((day, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => toggleDay(i)}
                                                className={cn(
                                                    "w-11 h-11 rounded-full text-sm font-bold border-2 transition-all select-none",
                                                    scheduleDays.includes(i)
                                                        ? "bg-primary text-primary-foreground border-primary shadow scale-105"
                                                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                                                )}
                                                title={FULL_DAYS[i]}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Time picker */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Class Time</Label>
                                            <Input
                                                type="time"
                                                value={scheduleTime}
                                                onChange={e => onTimeChange(e.target.value)}
                                                className="w-36"
                                            />
                                        </div>
                                        {scheduleTime && (
                                            <p className="text-sm text-muted-foreground mt-4">{fmt12h(scheduleTime)} IST</p>
                                        )}
                                    </div>

                                    {/* Preview */}
                                    {scheduleDays.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {scheduleDays.sort().map(d => (
                                                <span
                                                    key={d}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                                                >
                                                    {FULL_DAYS[d]}
                                                    <button type="button" onClick={() => toggleDay(d)} className="hover:text-primary/60">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                                                🕐 {fmt12h(scheduleTime)} IST
                                            </span>
                                        </div>
                                    )}

                                    {scheduleDays.length === 0 && (
                                        <p className="text-xs text-muted-foreground">Select days above to set your class schedule.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

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

                    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-dashed border-primary/20 animate-in fade-in">
                        <div className="flex items-center gap-2 text-primary font-medium mb-2">
                            <Video className="h-4 w-4" /> Course Media & Advertising
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Course Thumbnail Image</Label>
                                {formData.thumbnailUrl ? (
                                    <div className="relative aspect-video rounded-md overflow-hidden border">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="object-cover w-full h-full" />
                                        <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setFormData({ ...formData, thumbnailUrl: "" })}>Remove</Button>
                                    </div>
                                ) : (
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "thumbnailUrl")}
                                        disabled={uploadingMedia}
                                    />
                                )}
                                <p className="text-xs text-muted-foreground">Catchy images increase enrollments. (16:9 ratio recommended)</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Promotional Video</Label>
                                {formData.promoVideoUrl ? (
                                    <div className="relative aspect-video rounded-md overflow-hidden border bg-black flex items-center justify-center">
                                        <video src={formData.promoVideoUrl} controls className="object-cover w-full h-full" />
                                        <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setFormData({ ...formData, promoVideoUrl: "" })}>Remove</Button>
                                    </div>
                                ) : (
                                    <Input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "promoVideoUrl")}
                                        disabled={uploadingMedia}
                                    />
                                )}
                                <p className="text-xs text-muted-foreground">A short 1-minute video explaining what students will learn.</p>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Course Brochure (Syllabus/Details)</Label>
                                {formData.brochureUrl ? (
                                    <div className="flex items-center gap-4 p-4 border rounded-md bg-muted/30">
                                        <div className="flex-1 truncate text-sm">
                                            <a href={formData.brochureUrl} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">
                                                {formData.brochureUrl.split('/').pop() || 'Course_Brochure'}
                                            </a>
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={() => setFormData({ ...formData, brochureUrl: "" })}>Remove</Button>
                                    </div>
                                ) : (
                                    <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "brochureUrl")}
                                        disabled={uploadingMedia}
                                    />
                                )}
                                <p className="text-xs text-muted-foreground">Optional: Upload a PDF, Word, or PPT document with full course details.</p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section - Different for VIDEO vs LIVE */}

                    <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                        <div className="space-y-0.5">
                            <Label className="text-base">Free Course</Label>
                            <p className="text-sm text-muted-foreground">Make this course free for all registered users.</p>
                        </div>
                        <Switch
                            checked={formData.isFree}
                            onCheckedChange={(checked) => {
                                if (courseType === "VIDEO") {
                                    setFormData({ isFree: checked, price: checked ? 0 : formData.price });
                                } else if (courseType === "LIVE") {
                                    setFormData({ isFree: checked, price: checked ? 0 : formData.price, pricePerClass: checked ? 0 : (formData as typeof liveData).pricePerClass });
                                } else {
                                    setFormData({ isFree: checked, price: checked ? 0 : formData.price });
                                }
                            }}
                        />
                    </div>

                    {(courseType === "VIDEO" || courseType === "TEST_SERIES") ? (
                        /* VIDEO/TEST_SERIES: Self-paced - start date + price, no end date */
                        <div className="space-y-4">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <Label>{courseType === "VIDEO" ? "Course Available From" : "Test Series Available From"}</Label>
                                <Input
                                    type="date"
                                    value={(formData as { startDate?: string }).startDate || ""}
                                    onChange={e => setFormData({ startDate: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {courseType === "VIDEO"
                                        ? "Students can enroll anytime after this date and learn at their own pace — no end date."
                                        : "Students can access tests in this series once they enroll after this date."}
                                </p>
                            </div>

                            {/* Price (only if not free) */}
                            {!formData.isFree && (
                                <div className="space-y-2">
                                    <Label>Course Price</Label>
                                    <div className="flex gap-2">
                                        <Select value={formData.currency} onValueChange={(val) => setFormData({ currency: val })}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">₹ INR</SelectItem>
                                                <SelectItem value="USD">$ USD</SelectItem>
                                                <SelectItem value="CAD">$ CAD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ price: e.target.value === '' ? '' : Number(e.target.value) })}
                                            placeholder="e.g. 2999"
                                            className="flex-1"
                                            min="0"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">One-time payment for lifetime access</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-dashed border-primary/20 animate-in fade-in">
                            <h4 className="font-semibold text-sm">Pricing & Schedule</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date *</Label>
                                    <Input
                                        type="date"
                                        value={(formData as typeof liveData).startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date *</Label>
                                    <Input
                                        type="date"
                                        value={(formData as typeof liveData).endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Classes</Label>
                                    <Input
                                        type="number"
                                        value={(formData as typeof liveData).totalClasses}
                                        onChange={e => {
                                            const val = e.target.value === '' ? '' : Number(e.target.value);
                                            const classes = val === '' ? 0 : Number(val);
                                            const perClass = Number((formData as typeof liveData).pricePerClass) || 0;
                                            setFormData({
                                                ...formData,
                                                totalClasses: val,
                                                price: classes * perClass
                                            });
                                        }}
                                        placeholder="e.g. 20"
                                        min="0"
                                    />
                                </div>
                                {!formData.isFree && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Price Per Class (₹)</Label>
                                            <Input
                                                type="number"
                                                value={(formData as typeof liveData).pricePerClass}
                                                onChange={e => {
                                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                                    const perClass = val === '' ? 0 : Number(val);
                                                    const count = Number((formData as typeof liveData).totalClasses) || 0;
                                                    setFormData({
                                                        ...formData,
                                                        pricePerClass: val,
                                                        price: count * perClass
                                                    });
                                                }}
                                                placeholder="e.g. 500"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Total Price (calculated)</Label>
                                            <div className="flex gap-2">
                                                <Select value={formData.currency} onValueChange={(val) => setFormData({ ...formData, currency: val })}>
                                                    <SelectTrigger className="w-[120px] bg-muted">
                                                        <SelectValue placeholder="Currency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="INR">₹ INR</SelectItem>
                                                        <SelectItem value="USD">$ USD</SelectItem>
                                                        <SelectItem value="CAD">$ CAD</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    type="number"
                                                    value={formData.price}
                                                    disabled // This is calculated
                                                    className="bg-muted flex-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Discounted Price (optional)</Label>
                                            <div className="flex gap-2">
                                                <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted text-sm text-muted-foreground w-[120px]">
                                                    {formData.currency}
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={(formData as typeof liveData).discountedPrice}
                                                    onChange={e => setFormData({ ...formData, discountedPrice: e.target.value === '' ? '' : Number(e.target.value) })}
                                                    placeholder="Optional overall offer"
                                                    className="rounded-l-none flex-1"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {!formData.isFree && Number((formData as typeof liveData).discountedPrice) > 0 && Number((formData as typeof liveData).discountedPrice) < Number(formData.price) && (
                                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                        💰 Discount: ₹{Number(formData.price) - Number((formData as typeof liveData).discountedPrice)} OFF
                                        ({Math.round(((Number(formData.price) - Number((formData as typeof liveData).discountedPrice)) / Number(formData.price)) * 100)}% savings)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
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
