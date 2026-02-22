"use client";

import { useAuth } from "@/context/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PayoutSettings } from "@/components/settings/PayoutSettings";
import { AvailabilitySettings } from "@/components/settings/AvailabilitySettings";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { user, updateUser, token, isLoading } = useAuth();
    const isInstructor = user?.role === 'INSTRUCTOR';

    if (isLoading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto px-4 py-10">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 md:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px]" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                Account <span className="text-primary italic">Settings</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-300 border border-white/5">
                                    {user?.role || 'STUDENT'}
                                </span>
                                <span className="text-[11px] font-medium text-zinc-400">
                                    {user?.email}
                                </span>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-base max-w-md font-medium">Customize your learning experience and keep your account secure.</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:w-80 shadow-inner">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500">Profile Strength</span>
                            <span className="text-emerald-400 font-mono text-lg font-bold">85%</span>
                        </div>
                        <Progress
                            value={85}
                            className="h-3 bg-white/10"
                            indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-1000"
                        />
                        <p className="text-[10px] text-zinc-500 mt-3 flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Excellent! Your profile is almost complete.
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-10">
                <div className="flex justify-center md:justify-start">
                    <TabsList className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-xl shadow-zinc-200/20">
                        <TabsTrigger
                            value="profile"
                            className="rounded-xl px-8 py-3 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all duration-300"
                        >
                            Profile
                        </TabsTrigger>
                        {isInstructor && (
                            <TabsTrigger
                                value="payouts"
                                className="rounded-xl px-8 py-3 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all duration-300"
                            >
                                Payouts
                            </TabsTrigger>
                        )}
                        {isInstructor && (
                            <TabsTrigger
                                value="availability"
                                className="rounded-xl px-8 py-3 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all duration-300"
                            >
                                Availability
                            </TabsTrigger>
                        )}
                        <TabsTrigger
                            value="security"
                            className="rounded-xl px-8 py-3 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all duration-300"
                        >
                            Security
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="rounded-xl px-8 py-3 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-lg font-bold transition-all duration-300"
                        >
                            Notifications
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="profile" className="outline-none focus:ring-0 transition-all">
                    <ProfileSettings user={user} updateUser={updateUser} token={token} />
                </TabsContent>

                {isInstructor && (
                    <TabsContent value="payouts" className="space-y-4">
                        <PayoutSettings />
                    </TabsContent>
                )}

                {isInstructor && (
                    <TabsContent value="availability" className="space-y-4">
                        <AvailabilitySettings />
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
