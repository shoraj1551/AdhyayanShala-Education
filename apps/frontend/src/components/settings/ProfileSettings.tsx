"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Linkedin, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ProfileSettingsProps {
    user: {
        name?: string;
        avatar?: string;
        bio?: string;
        linkedin?: string;
        expertise?: string;
        role?: string;
        email?: string;
    } | null;
    updateUser: (user: {
        name?: string;
        avatar?: string;
        bio?: string;
        linkedin?: string;
        expertise?: string;
        role?: string;
        email?: string;
    }) => void;
    token: string | null;
}

export function ProfileSettings({ user, updateUser, token }: ProfileSettingsProps) {
    const isInstructor = user?.role === 'INSTRUCTOR';

    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [linkedin, setLinkedin] = useState(user?.linkedin || "");
    const [expertise, setExpertise] = useState(user?.expertise || "");
    const [isLoading, setIsLoading] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setAvatar(user.avatar || "");
            setBio(user.bio || "");
            setLinkedin(user.linkedin || "");
            setExpertise(user.expertise || "");
        }
    }, [user]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Upload file
            const res = await api.upload(file, token!);
            setAvatar(res.url);
            toast.success("Avatar uploaded successfully!");
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.error("Upload failed", err);
            toast.error(err.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = { name, avatar, bio, linkedin, expertise };
            const res = await api.put("/auth/profile", payload, token!);
            updateUser(res.user);
            toast.success("Profile updated successfully!");
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast.error(err.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-2 border-white/50 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-8 border-b border-zinc-100/50 bg-white/20">
                <CardTitle className="text-2xl font-black tracking-tight">Public <span className="text-primary">Profile</span></CardTitle>
                <CardDescription className="text-base text-zinc-500 font-medium">
                    {isInstructor
                        ? "This is how students will see you on course landing pages."
                        : "Manage your personal information and how others see you."}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
                <form onSubmit={handleUpdateProfile} className="space-y-12">
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-6 shrink-0 w-full lg:w-48">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Avatar className="h-40 w-40 border-8 border-white/80 shadow-2xl group-hover:scale-105 transition-all duration-500 relative z-10">
                                    <AvatarImage src={avatar} className="object-cover" />
                                    <AvatarFallback className="text-5xl bg-zinc-100 font-black text-zinc-400">
                                        {name[0]?.toUpperCase() || <User size={48} />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-2 bg-zinc-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-sm">
                                    {isUploading ? <Loader2 className="text-white h-10 w-10 animate-spin" /> : <Camera className="text-white h-10 w-10 transform group-hover:scale-110 transition-transform" />}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="space-y-3 w-full text-center">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="w-full font-bold bg-white hover:bg-zinc-50 border-zinc-200 transition-colors shadow-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? "Uploading..." : "Change Photo"}
                                </Button>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Square JPG/PNG (Max 2MB)</p>
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="flex-1 space-y-8 w-full">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-zinc-500">Full Name</Label>
                                    <Input
                                        id="name"
                                        className="h-12 bg-white/50 border-white focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-zinc-500">Email Address</Label>
                                    <div className="relative group">
                                        <Input
                                            id="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="h-12 bg-zinc-50/50 border-zinc-100 opacity-70 cursor-not-allowed rounded-xl font-medium"
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold text-zinc-400 bg-white px-2 py-1 rounded-md border shadow-sm">READ ONLY</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isInstructor && (
                                <div className="space-y-3">
                                    <Label htmlFor="expertise" className="text-sm font-bold uppercase tracking-wider text-zinc-500">Professional Headline</Label>
                                    <Input
                                        id="expertise"
                                        className="h-12 bg-white/50 border-white focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium"
                                        placeholder="e.g. Senior Software Architect or Lead Educator"
                                        value={expertise}
                                        onChange={(e) => setExpertise(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label htmlFor="bio" className="text-sm font-bold uppercase tracking-wider text-zinc-500">About Me</Label>
                                <div className="relative">
                                    <Textarea
                                        id="bio"
                                        placeholder="Share your journey with the community..."
                                        className="min-h-[160px] bg-white/50 border-white focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl font-medium p-4 resize-none leading-relaxed"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                    <div className="absolute bottom-4 right-4 text-[10px] font-bold text-zinc-400">
                                        {bio.length}/500
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold uppercase tracking-wider text-zinc-500">LinkedIn Profile</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 bg-zinc-900 rounded-md flex items-center justify-center text-white p-1">
                                        <Linkedin size={14} fill="white" />
                                    </div>
                                    <Input
                                        className="h-12 pl-12 bg-white/50 border-white focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-xs font-black uppercase tracking-widest">Profile is Live</span>
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto min-w-[200px] h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]"
                        >
                            {isLoading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                            {isLoading ? "UPDATING..." : "SAVE PROFILE"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
