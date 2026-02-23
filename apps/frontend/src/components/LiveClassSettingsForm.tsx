
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Plus, Trash2, Clock, Calendar, Users, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    moderatorEmails?: string[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function LiveClassSettingsForm({ courseId }: { courseId: string }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<LiveSettings>({
        platform: 'ZOOM',
        meetingLink: '',
        scheduleNote: '',
        difficulty: 'Beginner',
        moderatorEmails: []
    });
    const [newModEmail, setNewModEmail] = useState("");
    const [schedules, setSchedules] = useState<Schedule[]>([]);

    // Visual schedule builder state
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [newTime, setNewTime] = useState("20:00");
    const [duration, setDuration] = useState("60");

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    // Auto-generate schedule note from added schedules
    useEffect(() => {
        if (schedules.length > 0) {
            const byTime: Record<string, string[]> = {};
            schedules.forEach(s => {
                const key = formatTime12h(s.startTime);
                if (!byTime[key]) byTime[key] = [];
                byTime[key].push(DAYS[s.dayOfWeek]);
            });
            const note = Object.entries(byTime)
                .map(([time, days]) => `${days.join(", ")} at ${time} IST`)
                .join(" | ");
            setSettings(prev => ({ ...prev, scheduleNote: note }));
        }
    }, [schedules]);

    const formatTime12h = (time24: string) => {
        const [h, m] = time24.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, "0")} ${period}`;
    };

    const fetchSettings = async () => {
        try {
            const res = await api.get(`/courses/${courseId}/live`, token || undefined);
            if (res.data?.settings) setSettings(res.data.settings);
            if (res.data?.schedules) setSchedules(res.data.schedules);
        } catch (error) {
            console.error("Failed to fetch live settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!token) return toast.error("Please login first");
        setSaving(true);
        try {
            await api.post(`/courses/${courseId}/live`, settings, token);
            toast.success("Settings saved!");
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleAddSchedule = async () => {
        if (!token) return toast.error("Please login first");
        if (selectedDays.length === 0) return toast.error("Please select at least one day");

        try {
            // Add each selected day as a separate schedule entry
            const added: Schedule[] = [];
            for (const day of selectedDays) {
                const res = await api.post(`/courses/${courseId}/live/schedule`, {
                    dayOfWeek: day,
                    startTime: newTime,
                    duration: parseInt(duration)
                }, token);
                added.push(res.data ?? res);
            }
            setSchedules(prev => [...prev, ...added]);
            setSelectedDays([]);
            toast.success(`Schedule added for ${added.length} day(s)`);
        } catch {
            toast.error("Failed to add schedule. Make sure the course exists and you are logged in.");
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        if (!token) return toast.error("Please login first");
        try {
            await api.delete(`/courses/live/schedule/${id}`, undefined, token);
            setSchedules(prev => prev.filter(s => s.id !== id));
            toast.success("Schedule removed");
        } catch {
            toast.error("Failed to remove schedule");
        }
    };

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const addModerator = () => {
        if (!newModEmail) return;
        if (!newModEmail.includes("@")) return toast.error("Invalid email");
        if (settings.moderatorEmails?.includes(newModEmail)) return toast.error("Already added");

        setSettings(prev => ({
            ...prev,
            moderatorEmails: [...(prev.moderatorEmails || []), newModEmail]
        }));
        setNewModEmail("");
    };

    const removeModerator = (email: string) => {
        setSettings(prev => ({
            ...prev,
            moderatorEmails: prev.moderatorEmails?.filter(e => e !== email) || []
        }));
    };

    if (loading) return (
        <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Meeting Settings */}
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
                        <Label>Schedule Summary</Label>
                        <Input
                            placeholder="Auto-generated from Class Schedule below"
                            value={settings.scheduleNote || ''}
                            onChange={(e) => setSettings({ ...settings, scheduleNote: e.target.value })}
                            readOnly={schedules.length > 0}
                            className={schedules.length > 0 ? "bg-muted" : ""}
                        />
                        {schedules.length > 0 && (
                            <p className="text-xs text-primary">
                                ✨ Auto-generated from your weekly schedule. Remove all slots to edit manually.
                            </p>
                        )}
                    </div>

                    <Button onClick={handleSaveSettings} disabled={saving}>
                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Settings"}
                    </Button>
                </CardContent>
            </Card>

            {/* Moderator Management */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Persistent Moderators
                    </CardTitle>
                    <CardDescription>
                        Grant moderator rights to co-instructors or assistants. These users will automatically get control rights when joining.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-white/80 rounded-lg p-4 mb-4 border border-primary/10">
                        <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" /> Moderator Rights:
                        </h4>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4 font-medium">
                            <li>Manage participants (Mute/Kick)</li>
                            <li>Override meeting settings</li>
                            <li>Control session recording and live-streaming</li>
                            <li>Access to moderator-only chat/tools</li>
                        </ul>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Assistant's email address"
                            value={newModEmail}
                            onChange={(e) => setNewModEmail(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addModerator()}
                        />
                        <Button variant="outline" onClick={addModerator}>
                            <Plus className="h-4 w-4 mr-2" /> Add
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {(settings.moderatorEmails || []).length > 0 ? (
                            settings.moderatorEmails?.map(email => (
                                <div key={email} className="flex items-center justify-between p-2 bg-white rounded-md border text-sm">
                                    <span className="font-medium truncate">{email}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeModerator(email)}
                                        className="text-destructive h-8 w-8 p-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-4 text-xs text-muted-foreground italic">No persistent moderators added.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Visual Schedule Builder */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Weekly Class Schedule
                    </CardTitle>
                    <CardDescription>
                        Select the days and time for your recurring live sessions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Day toggles */}
                    <div className="space-y-2">
                        <Label>Select Days</Label>
                        <div className="flex gap-2 flex-wrap">
                            {DAYS.map((day, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => toggleDay(i)}
                                    className={cn(
                                        "w-12 h-12 rounded-full text-sm font-semibold border-2 transition-all",
                                        selectedDays.includes(i)
                                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                                    )}
                                    title={FULL_DAYS[i]}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        {selectedDays.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Selected: {selectedDays.map(d => FULL_DAYS[d]).join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Time + Duration */}
                    <div className="flex gap-4 items-end flex-wrap">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Class Time
                            </Label>
                            <Input
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="w-36"
                            />
                            {newTime && (
                                <p className="text-xs text-muted-foreground">{formatTime12h(newTime)} IST</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="90">1.5 hours</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                    <SelectItem value="180">3 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleAddSchedule}
                            disabled={selectedDays.length === 0}
                            className="mb-0.5"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add {selectedDays.length > 1 ? `${selectedDays.length} Slots` : "Slot"}
                        </Button>
                    </div>

                    {/* Current Schedules */}
                    <div className="space-y-2">
                        {schedules.length > 0 ? (
                            <div className="grid gap-2">
                                {schedules
                                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                                    .map(s => (
                                        <div
                                            key={s.id}
                                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                                                    {DAYS[s.dayOfWeek]}
                                                </span>
                                                <div>
                                                    <p className="font-medium">{FULL_DAYS[s.dayOfWeek]}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatTime12h(s.startTime)} IST &bull; {s.duration} mins
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteSchedule(s.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No recurring slots added yet.</p>
                                <p className="text-xs mt-1">Select days above and click &quot;Add Slot&quot;.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
