"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Clock, Trash2, IndianRupee, Video, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Slot {
    id?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

interface Booking {
    id: string;
    date: string;
    startTime: string;
    duration: number;
    status: string;
    isFree: boolean;
    amountPaid: number;
    context: string;
    questions: string;
    meetingLink: string;
    student: {
        name: string;
        email: string;
        avatar?: string;
    };
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function InstructorMentorshipPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [fee, setFee] = useState<number>(0);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        // Fetch Settings & Availability
        api.get("/mentorship/availability", token).then(res => {
            setFee(res.fee);
            setSlots(res.slots || []);
        });

        // Fetch Sessions
        api.get("/mentorship/sessions", token).then(res => {
            setBookings(res);
        }).finally(() => setLoading(false));
    }, [token]);

    const handleSaveFee = async () => {
        if (!token) return;
        setSaving(true);
        try {
            await api.post("/mentorship/fee", { fee: Number(fee) }, token);
            toast.success("Mentorship fee updated successfully");
        } catch {
            toast.error("Failed to update fee");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSlots = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const res = await api.post("/mentorship/availability", { slots }, token);
            setSlots(res.slots || []);
            toast.success("Availability updated successfully");
        } catch {
            toast.error("Failed to update availability");
        } finally {
            setSaving(false);
        }
    };

    const addSlot = () => {
        setSlots([...slots, { dayOfWeek: 1, startTime: "09:00", endTime: "10:00", isActive: true }]);
    };

    const updateSlot = (index: number, key: keyof Slot, value: any) => {
        const newSlots = [...slots];
        newSlots[index] = { ...newSlots[index], [key]: value };
        setSlots(newSlots);
    };

    const removeSlot = (index: number) => {
        const newSlots = [...slots];
        newSlots.splice(index, 1);
        setSlots(newSlots);
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mentorship Settings</h1>
                <p className="text-muted-foreground">Manage your 1-on-1 session availability and earnings.</p>
            </div>

            <Tabs defaultValue="availability" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="availability">Availability & Pricing</TabsTrigger>
                    <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="availability" className="space-y-6">
                    {/* Hourly Rate */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Session Pricing</CardTitle>
                            <CardDescription>
                                Set your default hourly rate. Note: Students enrolled in your courses get their first 2 sessions FREE.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 max-w-sm">
                                <div className="space-y-2 flex-1">
                                    <Label>Hourly Rate (INR)</Label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            className="pl-9"
                                            value={fee}
                                            onChange={e => setFee(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <Button className="mt-6" onClick={handleSaveFee} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Price
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weekly Schedule limit */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Weekly Availability</CardTitle>
                                <CardDescription>Add timeslots when students can book a session with you.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={addSlot} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Timeslot
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {slots.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    You have no available timeslots. Students cannot book sessions with you right now.
                                </div>
                            )}

                            {slots.map((slot, index) => (
                                <div key={index} className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-card md:flex-nowrap">
                                    <div className="w-full md:w-1/3">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Day of Week</Label>
                                        <Select
                                            value={String(slot.dayOfWeek)}
                                            onValueChange={v => updateSlot(index, 'dayOfWeek', parseInt(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DAYS.map((day, i) => (
                                                    <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="w-full md:w-1/4">
                                        <Label className="text-xs text-muted-foreground mb-1 block">Start Time</Label>
                                        <Input
                                            type="time"
                                            value={slot.startTime}
                                            onChange={e => updateSlot(index, 'startTime', e.target.value)}
                                        />
                                    </div>

                                    <div className="w-full md:w-1/4">
                                        <Label className="text-xs text-muted-foreground mb-1 block">End Time</Label>
                                        <Input
                                            type="time"
                                            value={slot.endTime}
                                            onChange={e => updateSlot(index, 'endTime', e.target.value)}
                                        />
                                    </div>

                                    <div className="w-full md:w-auto mt-4 md:mt-0 flex justify-end flex-1">
                                        <Button variant="ghost" size="icon" onClick={() => removeSlot(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        {slots.length > 0 && (
                            <CardFooter>
                                <Button className="w-full md:w-auto ml-auto" onClick={handleSaveSlots} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Schedule
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="sessions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Sessions</CardTitle>
                            <CardDescription>View and join your booked mentorship sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {bookings.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        No upcoming sessions booked yet.
                                    </div>
                                )}

                                {bookings.map(booking => (
                                    <div key={booking.id} className="p-4 sm:p-6 border rounded-xl bg-card flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Clock className="h-4 w-4 text-primary" />
                                                        <span className="font-semibold">{new Date(booking.date).toLocaleDateString()} at {booking.startTime}</span>
                                                        <Badge variant="outline">{booking.duration} mins</Badge>
                                                    </div>
                                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        {booking.student.name || "Student"}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1 text-ellipsis overflow-hidden">{booking.student.email}</p>
                                                </div>
                                                <Badge variant={booking.isFree ? "secondary" : "default"}>
                                                    {booking.isFree ? "Free Session" : `Paid: ₹${booking.amountPaid}`}
                                                </Badge>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4 text-sm mt-4 p-4 bg-muted/50 rounded-lg">
                                                <div>
                                                    <span className="font-semibold text-muted-foreground block mb-1">Context</span>
                                                    <p>{booking.context || "No context provided"}</p>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-muted-foreground block mb-1">Questions</span>
                                                    <p>{booking.questions || "No questions provided"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-48 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                                            <span className={cn("text-xs font-bold text-center", booking.status === "CONFIRMED" ? "text-green-600" : "text-amber-600")}>
                                                STATUS: {booking.status}
                                            </span>
                                            <Button className="w-full gap-2" asChild disabled={!booking.meetingLink}>
                                                <a href={booking.meetingLink || "#"} target="_blank" rel="noopener noreferrer">
                                                    <Video className="h-4 w-4" /> Join Meeting
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
