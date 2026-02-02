"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, CreditCard, Shield, Globe, Linkedin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const { user, updateUser, token } = useAuth();
    const isInstructor = user?.role === 'INSTRUCTOR';

    // State for Profile Tab
    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [linkedin, setLinkedin] = useState(user?.linkedin || "");
    const [website, setWebsite] = useState(""); // Currently not in user model, placeholder
    const [expertise, setExpertise] = useState(user?.expertise || "");

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Sync local state when user data is loaded/updated
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setAvatar(user.avatar || "");
            setBio(user.bio || "");
            setLinkedin(user.linkedin || "");
            setExpertise(user.expertise || "");
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            // Include new fields in payload
            const payload = {
                name,
                avatar,
                bio,
                linkedin,
                expertise
            };
            const res = await api.put("/auth/profile", payload, token!);
            updateUser(res.user);
            setMessage("Profile updated successfully!");
        } catch (error: any) {
            setMessage(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your public profile and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    {isInstructor && <TabsTrigger value="payouts">Payouts & Billing</TabsTrigger>}
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Public Profile</CardTitle>
                            <CardDescription>
                                {isInstructor
                                    ? "This is how students will see you on course landing pages."
                                    : "Manage your personal information."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-8">
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Avatar Section */}
                                    <div className="flex flex-col items-center space-y-4">
                                        <Avatar className="h-32 w-32 border-4 border-muted">
                                            <AvatarImage src={avatar} />
                                            <AvatarFallback className="text-4xl bg-muted">
                                                {name[0]?.toUpperCase() || <User />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-2 w-full max-w-xs">
                                            <Label htmlFor="avatar" className="text-xs text-muted-foreground">Avatar URL</Label>
                                            <Input
                                                id="avatar"
                                                placeholder="https://..."
                                                value={avatar}
                                                onChange={(e) => setAvatar(e.target.value)}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Main Form */}
                                    <div className="flex-1 space-y-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Display Name</Label>
                                                <Input
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    value={user?.email || ""}
                                                    disabled
                                                    className="bg-muted opacity-50 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {isInstructor && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="expertise">Professional Headline</Label>
                                                    <Input
                                                        id="expertise"
                                                        placeholder="e.g. Senior Software Engineer at Google"
                                                        value={expertise}
                                                        onChange={(e) => setExpertise(e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="bio">Biography</Label>
                                                    <Textarea
                                                        id="bio"
                                                        placeholder="Tell students about your experience..."
                                                        className="min-h-[120px]"
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label>LinkedIn Profile</Label>
                                                        <div className="relative">
                                                            <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                className="pl-9"
                                                                placeholder="https://linkedin.com/in/..."
                                                                value={linkedin}
                                                                onChange={(e) => setLinkedin(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Website</Label>
                                                        <div className="relative">
                                                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                className="pl-9"
                                                                placeholder="https://your-portfolio.com"
                                                                value={website}
                                                                onChange={(e) => setWebsite(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    {message && (
                                        <p className={message.includes("success") ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                                            {message}
                                        </p>
                                    )}
                                    <Button type="submit" disabled={isLoading} className="ml-auto">
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PAYOUTS TAB (Localized for India) */}
                <TabsContent value="payouts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payout Settings</CardTitle>
                            <CardDescription>Securely connect your account to receive earnings directly to your bank or UPI.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* UPI Section */}
                            <div className="p-4 border rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-12 bg-white rounded flex items-center justify-center p-0.5">
                                                {/* Text based UPI logo placeholder */}
                                                <span className="text-[10px] font-bold text-orange-600 tracking-tighter">BHIM UPI</span>
                                            </div>
                                            <h3 className="font-semibold text-white">UPI Payment</h3>
                                        </div>
                                        <p className="text-sm text-zinc-400">Instant transfer to your localized payment address.</p>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 rounded border border-green-500/20">Recommended</span>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Input
                                        placeholder="username@okhdfcbank"
                                        className="bg-zinc-950/50 border-white/10"
                                    />
                                    <Button variant="secondary" className="bg-orange-600 hover:bg-orange-700 text-white border-none">Verify</Button>
                                </div>
                            </div>

                            {/* Bank Transfer Section */}
                            <div className="p-4 border rounded-xl bg-muted/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <CreditCard className="h-5 w-5 text-blue-400" />
                                    <h3 className="font-semibold text-white">Bank Transfer (NEFT/IMPS)</h3>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Account Holder Name</Label>
                                        <Input placeholder="As per bank records" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Account Number</Label>
                                        <Input type="password" placeholder="•••• •••• •••• 1234" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">IFSC Code</Label>
                                        <Input placeholder="HDFC0001234" className="uppercase" maxLength={11} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Bank Name</Label>
                                        <Input placeholder="e.g. HDFC Bank" />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button variant="outline">Save Bank Details</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SECURITY TAB (Mock) */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your password and authentication methods.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <p className="font-medium">Password</p>
                                        <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                                    </div>
                                    <Button variant="outline">Update Password</Button>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Shield className="h-6 w-6 text-emerald-500" />
                                        <div className="space-y-1">
                                            <p className="font-medium">Two-Factor Authentication</p>
                                            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                                        </div>
                                    </div>
                                    <Button variant="outline">Enable 2FA</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
