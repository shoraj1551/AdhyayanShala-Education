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
        <Card>
            <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what updates you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex items-start space-x-4">
                    <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="course-updates" className="text-base font-medium">Course Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive emails about new content in your enrolled courses.</p>
                    </div>
                    <Switch
                        id="course-updates"
                        checked={settings.courseUpdates}
                        onCheckedChange={() => handleToggle('courseUpdates')}
                    />
                </div>

                <div className="flex items-start space-x-4">
                    <MessageSquare className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="replies" className="text-base font-medium">Discussion Replies</Label>
                        <p className="text-sm text-muted-foreground">Get notified when someone replies to your comments.</p>
                    </div>
                    <Switch
                        id="replies"
                        checked={settings.discussionReplies}
                        onCheckedChange={() => handleToggle('discussionReplies')}
                    />
                </div>

                <div className="flex items-start space-x-4">
                    <Bell className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="marketing" className="text-base font-medium">Marketing & Offers</Label>
                        <p className="text-sm text-muted-foreground">Receive emails about new features and special offers.</p>
                    </div>
                    <Switch
                        id="marketing"
                        checked={settings.marketingEmails}
                        onCheckedChange={() => handleToggle('marketingEmails')}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
