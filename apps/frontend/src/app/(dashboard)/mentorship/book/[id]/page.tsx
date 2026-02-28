"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar as CalendarIcon, Clock, MoveRight, ReceiptIndianRupee, Tag } from "lucide-react";

interface Slot {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

interface Instructor {
    name: string;
    avatar: string;
    instructorProfile?: {
        bio?: string;
        mentorshipFee: number;
    };
}


export default function BookMentorshipPage() {
    const params = useParams();
    const router = useRouter();
    const instructorId = params.id as string;
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [bookingProgress, setBookingProgress] = useState(false);

    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [slots, setSlots] = useState<Slot[]>([]);

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [context, setContext] = useState("");
    const [questions, setQuestions] = useState("");

    const [isFree, setIsFree] = useState(false);

    useEffect(() => {
        if (!instructorId || !token) return;

        // Fetch instructor availability
        api.get(`/mentorship/instructors/${instructorId}/availability`, token).then(res => {
            setInstructor(res.instructor);
            setSlots(res.slots || []);
        }).finally(() => setLoading(false));

        // Quick check to simulate `isFree` check (In prod, backend handles it, but good to show UI)
        api.get(`/courses/student`, token).then(res => {
            const hasCourse = res.data?.some((c: any) => c.instructor?.id === instructorId);
            api.get(`/mentorship/sessions`, token).then(sessions => {
                const pastForThisInstructor = sessions.filter((s: any) => s.instructorId === instructorId).length;
                setIsFree(hasCourse && pastForThisInstructor < 2);
            });
        });

    }, [instructorId, token]);

    const handleBook = async () => {
        if (!date || !selectedSlot) {
            toast.error("Please select a date and an available slot.");
            return;
        }

        setBookingProgress(true);
        try {
            const res = await api.post("/mentorship/book", {
                instructorId,
                date: new Date(date).toISOString(),
                startTime: selectedSlot.startTime,
                duration: 60, // Default 1 hour
                context,
                questions
            }, token);

            toast.success("Session booked successfully!");
            // Redirect to confirmation page
            router.push(`/mentorship/confirmation/${res.booking.id}`);
        } catch {
            toast.error("Failed to book session");
        } finally {
            setBookingProgress(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (!instructor) return <div className="p-10 text-center">Instructor not found</div>;

    const availableSlotsForDay = date ? slots.filter(s => s.dayOfWeek === new Date(date).getDay()) : [];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Book 1-on-1 Mentorship</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Get personalized guidance, ask questions, and accelerate your learning journey with a dedicated session.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">

                {/* Left Side: Instructor Profile & Summary */}
                <Card className="md:col-span-1 shadow-md bg-gradient-to-br from-card to-card/50">
                    <CardHeader className="text-center pb-2">
                        <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/10">
                            <AvatarImage src={instructor.avatar} />
                            <AvatarFallback className="text-2xl">{instructor.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <CardTitle>{instructor.name}</CardTitle>
                        <CardDescription className="line-clamp-3 mt-2">{instructor.instructorProfile?.bio || "Programming Mentor"}</CardDescription>

                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between py-2 border-t border-b border-border/50">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Duration
                            </span>
                            <span className="font-semibold text-sm">60 Mins</span>
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <ReceiptIndianRupee className="h-4 w-4" /> Session Fee
                            </span>
                            {isFree ? (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                                    <div className="flex items-center gap-2 font-bold justify-between mb-1">
                                        <span className="flex items-center gap-1"><Tag className="h-4 w-4" /> First 2 Free!</span>
                                        <span className="line-through opacity-60 text-xs">₹{instructor.instructorProfile?.mentorshipFee || 0}</span>
                                    </div>

                                    <p className="text-xs">Since you are enrolled in a course by this instructor, your session is free.</p>
                                </div>
                            ) : (
                                <div className="text-2xl font-bold text-primary">₹{instructor.instructorProfile?.mentorshipFee || 0}</div>
                            )}

                        </div>
                    </CardContent>
                </Card>

                {/* Right Side: Booking Form */}
                <div className="md:col-span-2 space-y-6">
                    {/* Time Selection */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" /> Select Date & Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-6">
                            <div className="sm:w-1/2 flex justify-center sm:justify-start">
                                <Input
                                    type="date"
                                    value={date ? date.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setDate(new Date(e.target.value))}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full text-lg p-6"
                                />
                            </div>
                            <div className="sm:w-1/2 space-y-4">
                                <Label className="text-muted-foreground font-semibold">Available Slots</Label>
                                {date && availableSlotsForDay.length === 0 ? (
                                    <div className="p-4 text-sm text-center border-2 border-dashed rounded-lg text-muted-foreground">
                                        No slots available on this date.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableSlotsForDay.map(slot => (
                                            <Button
                                                key={slot.id}
                                                variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                                                className="w-full justify-start"
                                                onClick={() => setSelectedSlot(slot)}
                                            >
                                                {slot.startTime}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Context & Questions */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Preparation</CardTitle>
                            <CardDescription>Help your mentor prepare by sharing context in advance.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>What would you like to discuss?</Label>
                                <Textarea
                                    placeholder="Briefly describe the context or your current struggles..."
                                    value={context}
                                    onChange={e => setContext(e.target.value)}
                                    className="h-24"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Specific Questions</Label>
                                <Textarea
                                    placeholder="List the specific questions you want answered during the session..."
                                    value={questions}
                                    onChange={e => setQuestions(e.target.value)}
                                    className="h-24"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="pt-6 border-t bg-muted/20">
                            <Button
                                className="w-full gap-2 h-12 text-lg font-bold"
                                disabled={!date || !selectedSlot || bookingProgress}
                                onClick={handleBook}
                            >
                                {bookingProgress ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                    <>Confirm Booking <MoveRight className="h-5 w-5" /></>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    );
}
