
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { Loader2, Plus, Trash2 } from "lucide-react";

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
    difficulty: string;
}

export function LiveClassSettingsForm({ courseId }: { courseId: string }) {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<LiveSettings>({
        platform: 'ZOOM',
        meetingLink: '',
        scheduleNote: '',
        difficulty: 'Beginner'
    });
    const [schedules, setSchedules] = useState<Schedule[]>([]);

    // New Schedule State
    const [newDay, setNewDay] = useState("1");
    const [newTime, setNewTime] = useState("20:00");

    useEffect(() => {
        fetchSettings();
    }, [courseId]);

    const fetchSettings = async () => {
        try {
            const res = await api.get(`/courses/${courseId}/live`);
            if (res.data.settings) setSettings(res.data.settings);
            if (res.data.schedules) setSchedules(res.data.schedules);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await api.post(`/courses/${courseId}/live`, settings);
            toast.success("Settings saved");
        } catch (error) {
            toast.error("Failed to save settings");
        }
    };

    const handleAddSchedule = async () => {
        try {
            const res = await api.post(`/courses/${courseId}/live/schedule`, {
                dayOfWeek: parseInt(newDay),
                startTime: newTime,
                duration: 60
            });
            setSchedules([...schedules, res.data]);
            toast.success("Schedule added");
        } catch (error) {
            toast.error("Failed to add schedule");
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        try {
            await api.delete(`/courses/live/schedule/${id}`);
            setSchedules(schedules.filter(s => s.id !== id));
            toast.success("Schedule removed");
        } catch (error) {
            toast.error("Failed to remove schedule");
        }
    };

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // 0-6? Prisma/ISO usually 1-7 or 0-6. Let's assume 0=Sun for now based on JS Date.

    if (loading) return <Loader2 className="h-8 w-8 animate-spin" />;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Live Class Settings</CardTitle>
                    <CardDescription>Configure where and when your live classes happen.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Meeting Platform</Label>
                            <Select value={settings.platform} onValueChange={(v) => setSettings({ ...settings, platform: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ZOOM">Zoom Meeting</SelectItem>
                                    <SelectItem value="MEET">Google Meet</SelectItem>
                                    <SelectItem value="TEAMS">Microsoft Teams</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Meeting Link</Label>
                            <Input
                                placeholder="Paste your recurring meeting link here"
                                value={settings.meetingLink || ''}
                                onChange={(e) => setSettings({ ...settings, meetingLink: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Schedule Note</Label>
                        <Input
                            placeholder="e.g. Mon, Wed, Fri at 8 PM IST"
                            value={settings.scheduleNote || ''}
                            onChange={(e) => setSettings({ ...settings, scheduleNote: e.target.value })}
                        />
                    </div>

                    <Button onClick={handleSaveSettings}>Save Settings</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Class Schedule</CardTitle>
                    <CardDescription>Add recurring weekly slots.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-end">
                        <div className="space-y-2 flex-1">
                            <Label>Day</Label>
                            <Select value={newDay} onValueChange={setNewDay}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {days.map((d, i) => <SelectItem key={i} value={i.toString()}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label>Time (24h)</Label>
                            <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                        </div>
                        <Button onClick={handleAddSchedule} variant="outline"><Plus className="h-4 w-4 mr-2" /> Add</Button>
                    </div>

                    <div className="space-y-2 mt-4">
                        {schedules.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium w-12">{days[s.dayOfWeek]}</span>
                                    <span>{s.startTime}</span>
                                    <span className="text-muted-foreground text-sm">({s.duration} mins)</span>
                                </div>
                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteSchedule(s.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {schedules.length === 0 && <p className="text-sm text-muted-foreground">No recurring schedules added.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
