"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Linkedin, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ProfileSettingsProps {
    user: any;
    updateUser: (user: any) => void;
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
        } catch (error: any) {
            console.error("Upload failed", error);
            toast.error(error.message || "Failed to upload image");
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
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>
                    {isInstructor
                        ? "This is how students will see you on course landing pages."
                        : "Manage your personal information and how others see you."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4 shrink-0">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Avatar className="h-32 w-32 border-4 border-muted/50 group-hover:border-primary/50 transition-colors">
                                    <AvatarImage src={avatar} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-muted font-bold text-muted-foreground">
                                        {name[0]?.toUpperCase() || <User />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isUploading ? <Loader2 className="text-white h-8 w-8 animate-spin" /> : <Camera className="text-white h-8 w-8" />}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="space-y-2 w-full max-w-xs text-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? "Uploading..." : "Upload New Image"}
                                </Button>
                                {/* Hidden or smaller input for manual URL if needed, but let's just keep the state managed by upload */}
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="flex-1 space-y-6 w-full">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="bg-muted/50 opacity-70 cursor-not-allowed"
                                        title="Email cannot be changed"
                                    />
                                </div>
                            </div>

                            {isInstructor && (
                                <div className="space-y-2">
                                    <Label htmlFor="expertise">Professional Headline</Label>
                                    <Input
                                        id="expertise"
                                        placeholder="e.g. Senior Software Engineer at Google"
                                        value={expertise}
                                        onChange={(e) => setExpertise(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="bio">Biography</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell the community a little about yourself..."
                                    className="min-h-[120px] resize-none"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                                <p className="text-[0.8rem] text-muted-foreground text-right">
                                    {bio.length}/500 characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Social Profiles</Label>
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
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-end">
                        <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
