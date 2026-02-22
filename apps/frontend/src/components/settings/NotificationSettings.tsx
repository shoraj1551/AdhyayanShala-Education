"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NotificationSettings() {
    const [settings, setSettings] = useState({
        marketingEmails: true,
        securityAlerts: true,
        courseUpdates: true,
        discussionReplies: true,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            // Simulate save
            toast.success("Preferences saved.");
            return newState;
        });
    };

    return (
        <Card className="border-2 border-white/50 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-8 border-b border-zinc-100/50 bg-white/20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-zinc-900 rounded-lg text-white">
                        <Bell size={18} />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Channel <span className="text-primary">Preferences</span></CardTitle>
                </div>
                <CardDescription className="text-base text-zinc-500 font-medium">Configure exactly how and when you want to be reached.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
                <div className="grid gap-6">
                    <div className="flex items-start justify-between p-6 bg-white/60 rounded-2xl border border-white shadow-inner transition-all hover:shadow-md">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-violet-100 rounded-2xl text-violet-600">
                                <Mail size={24} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="course-updates" className="text-lg font-black tracking-tight cursor-pointer">Learning Updates</Label>
                                <p className="text-sm text-zinc-500 font-medium">Critical course changes, schedule updates, and new lessons.</p>
                            </div>
                        </div>
                        <Switch
                            id="course-updates"
                            checked={settings.courseUpdates}
                            onCheckedChange={() => handleToggle('courseUpdates')}
                            className="data-[state=checked]:bg-zinc-900"
                        />
                    </div>

                    <div className="flex items-start justify-between p-6 bg-white/60 rounded-2xl border border-white shadow-inner transition-all hover:shadow-md">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600">
                                <MessageSquare size={24} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="replies" className="text-lg font-black tracking-tight cursor-pointer">Community Talk</Label>
                                <p className="text-sm text-zinc-500 font-medium">Replies to your comments, announcements, and direct mentions.</p>
                            </div>
                        </div>
                        <Switch
                            id="replies"
                            checked={settings.discussionReplies}
                            onCheckedChange={() => handleToggle('discussionReplies')}
                            className="data-[state=checked]:bg-zinc-900"
                        />
                    </div>

                    <div className="flex items-start justify-between p-6 bg-white/60 rounded-2xl border border-white shadow-inner transition-all hover:shadow-md">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-amber-100 rounded-2xl text-amber-600">
                                <Bell size={24} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="marketing" className="text-lg font-black tracking-tight cursor-pointer">Weekly Digest</Label>
                                <p className="text-sm text-zinc-500 font-medium">New features, platform news, and curated learning resources.</p>
                            </div>
                        </div>
                        <Switch
                            id="marketing"
                            checked={settings.marketingEmails}
                            onCheckedChange={() => handleToggle('marketingEmails')}
                            className="data-[state=checked]:bg-zinc-900"
                        />
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-100/50 flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Global notification override</p>
                    <Button variant="link" className="text-zinc-900 font-black uppercase tracking-widest text-xs hover:text-primary transition-colors">
                        Unsubscribe From All
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
