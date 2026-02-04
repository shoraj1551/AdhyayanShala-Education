"use client";

import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PayoutSettings } from "@/components/settings/PayoutSettings";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { user, updateUser, token, isLoading } = useAuth();
    const isInstructor = user?.role === 'INSTRUCTOR';

    if (isLoading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto px-4 py-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your profile, security preferences, and notifications.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    {isInstructor && <TabsTrigger value="payouts">Payouts</TabsTrigger>}
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileSettings user={user} updateUser={updateUser} token={token} />
                </TabsContent>

                {isInstructor && (
                    <TabsContent value="payouts" className="space-y-4">
                        <PayoutSettings />
                    </TabsContent>
                )}

                <TabsContent value="security" className="space-y-4">
                    <SecuritySettings />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <NotificationSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
