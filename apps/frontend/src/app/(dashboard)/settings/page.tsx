"use client";

import { useAuth } from "@/context/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PayoutSettings } from "@/components/settings/PayoutSettings";
import { AvailabilitySettings } from "@/components/settings/AvailabilitySettings";
import { Loader2, User, Shield, Bell, CreditCard, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { user, updateUser, token, isLoading } = useAuth();
    const isInstructor = user?.role === 'INSTRUCTOR';

    if (isLoading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Standard Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                        Account Settings
                    </h1>
                    <p className="text-muted-foreground text-lg">Manage your profile, security preferences, and account notifications.</p>
                    <div className="flex items-center gap-3 pt-2">
                        <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/10">
                            {user?.role || 'STUDENT'}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground italic">
                            {user?.email}
                        </span>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:w-80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="relative z-10 flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Strength</span>
                        <span className="text-emerald-600 font-bold text-lg">85%</span>
                    </div>
                    <Progress
                        value={85}
                        className="h-2 bg-zinc-100"
                        indicatorClassName="bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    />
                    <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1.5 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Complete your bio to reach 100%!
                    </p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-8">
                <div className="border-b border-zinc-200">
                    <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
                        <TabsTrigger
                            value="profile"
                            className="rounded-none border-b-2 border-transparent px-2 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-bold transition-all text-sm flex items-center gap-2 hover:text-zinc-600"
                        >
                            <User className="h-4 w-4" /> Profile
                        </TabsTrigger>
                        {isInstructor && (
                            <TabsTrigger
                                value="payouts"
                                className="rounded-none border-b-2 border-transparent px-2 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-bold transition-all text-sm flex items-center gap-2 hover:text-zinc-600"
                            >
                                <CreditCard className="h-4 w-4" /> Payouts
                            </TabsTrigger>
                        )}
                        {isInstructor && (
                            <TabsTrigger
                                value="availability"
                                className="rounded-none border-b-2 border-transparent px-2 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-bold transition-all text-sm flex items-center gap-2 hover:text-zinc-600"
                            >
                                <Calendar className="h-4 w-4" /> Availability
                            </TabsTrigger>
                        )}
                        <TabsTrigger
                            value="security"
                            className="rounded-none border-b-2 border-transparent px-2 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-bold transition-all text-sm flex items-center gap-2 hover:text-zinc-600"
                        >
                            <Shield className="h-4 w-4" /> Security
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="rounded-none border-b-2 border-transparent px-2 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-bold transition-all text-sm flex items-center gap-2 hover:text-zinc-600"
                        >
                            <Bell className="h-4 w-4" /> Notifications
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-10">
                    <TabsContent value="profile" className="outline-none focus:ring-0 m-0">
                        <ProfileSettings user={user} updateUser={updateUser} token={token} />
                    </TabsContent>

                    {isInstructor && (
                        <TabsContent value="payouts" className="outline-none focus:ring-0 m-0">
                            <PayoutSettings />
                        </TabsContent>
                    )}

                    {isInstructor && (
                        <TabsContent value="availability" className="outline-none focus:ring-0 m-0">
                            <AvailabilitySettings />
                        </TabsContent>
                    )}

                    <TabsContent value="security" className="outline-none focus:ring-0 m-0">
                        <SecuritySettings />
                    </TabsContent>

                    <TabsContent value="notifications" className="outline-none focus:ring-0 m-0">
                        <NotificationSettings />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
