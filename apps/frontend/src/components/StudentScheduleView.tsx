
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Video, Download, Bell, Clock } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Schedule {
    id: string;
    dayOfWeek: number;
    startTime: string;
    duration: number;
}

interface LiveSettings {
    platform: string;
    meetingLink: string;
    scheduleNote: string;
}

export function StudentScheduleView({ courseId, isEnrolled }: { courseId: string, isEnrolled: boolean }) {
    const { user } = useAuth();
    const [settings, setSettings] = useState<LiveSettings | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);

    // Notification Preferences (Mock State - in real app, fetch from Enrollment)
    const [notify15m, setNotify15m] = useState(true);
    const [notify1h, setNotify1h] = useState(false);

    useEffect(() => {
        api.get(`/courses/${courseId}/live`).then(res => {
            setSettings(res.data.settings);
            setSchedules(res.data.schedules);
        });
    }, [courseId]);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const handleDownloadCalendar = () => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/calendar.ics`, '_blank');
    };

    const handleJoin = () => {
        if (settings?.meetingLink) window.open(settings.meetingLink, '_blank');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Live Class Status Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Video className="h-6 w-6 text-primary" />
                            <CardTitle>Live Class Information</CardTitle>
                        </div>
                        {settings?.platform && <Badge variant="secondary">{settings.platform}</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings?.scheduleNote && (
                        <p className="text-lg font-medium">{settings.scheduleNote}</p>
                    )}

                    <div className="flex gap-3">
                        <Button onClick={handleJoin} disabled={!settings?.meetingLink || !isEnrolled} className="gap-2">
                            <Video className="h-4 w-4" />
                            {isEnrolled ? "Join Class" : "Enroll to Join"}
                        </Button>
                        <Button variant="outline" onClick={handleDownloadCalendar} className="gap-2">
                            <Download className="h-4 w-4" />
                            Add to Calendar (.ics)
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Schedule List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" /> Weekly Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {schedules.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-md text-primary font-bold">
                                            <span className="text-xs uppercase">Every</span>
                                            <span>{days[s.dayOfWeek]}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{s.startTime}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {s.duration} mins
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {schedules.length === 0 && <p className="text-muted-foreground">No recurring schedule posted.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" /> Reminders
                        </CardTitle>
                        <CardDescription>Get notified before class starts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="notify-15m" className="flex flex-col space-y-1">
                                <span>15 Minutes Before</span>
                                <span className="font-normal text-xs text-muted-foreground">SMS & Email</span>
                            </Label>
                            <Switch id="notify-15m" checked={notify15m} onCheckedChange={setNotify15m} />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="notify-1h" className="flex flex-col space-y-1">
                                <span>1 Hour Before</span>
                                <span className="font-normal text-xs text-muted-foreground">Email Only</span>
                            </Label>
                            <Switch id="notify-1h" checked={notify1h} onCheckedChange={setNotify1h} />
                        </div>

                        <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground">
                            SMS notifications will be sent to {user?.phoneNumber || "your registered number"}.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
