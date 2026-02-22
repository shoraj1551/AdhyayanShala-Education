"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key, AlertTriangle, Lock, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function SecuritySettings() {
    const [twoFactor, setTwoFactor] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        setIsUpdatingPassword(true);
        // Simulate API call
        setTimeout(() => {
            setIsUpdatingPassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password updated successfully!");
        }, 1500);
    };

    return (
        <div className="space-y-10">
            <Card className="border-2 border-white/50 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-primary/5">
                <CardHeader className="pb-8 border-b border-zinc-100/50 bg-white/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-zinc-900 rounded-lg text-white">
                            <Lock size={18} />
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight">Access <span className="text-primary">Control</span></CardTitle>
                    </div>
                    <CardDescription className="text-base text-zinc-500 font-medium">Update your password to keep your account secure and private.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 md:p-12">
                    <form onSubmit={handleUpdatePassword} className="space-y-8 max-w-3xl">
                        <div className="space-y-3">
                            <Label htmlFor="current-password">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    className="h-12 bg-white/50 border-white focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium pr-12"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        className="h-12 bg-white/50 border-white focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium pr-12"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="h-12 bg-white/50 border-white focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all rounded-xl font-medium pr-12"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isUpdatingPassword || !currentPassword || !newPassword}
                                className="min-w-[180px] h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]"
                            >
                                {isUpdatingPassword ? "UPDATING..." : "UPDATE PASSWORD"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-2 border-white/50 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-emerald-500/5">
                <CardHeader className="pb-8 border-b border-zinc-100/50 bg-white/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500 rounded-lg text-white">
                            <Shield size={18} />
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight">Security <span className="text-emerald-500">Shield</span></CardTitle>
                    </div>
                    <CardDescription className="text-base text-zinc-500 font-medium font-medium">Extra layers of protection for your digital assets.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/60 p-6 rounded-2xl border border-white shadow-inner">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-emerald-100 rounded-2xl shadow-sm">
                                <Key className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-black tracking-tight">Authenticator App (2FA)</p>
                                <p className="text-sm text-zinc-500 font-medium">Secondary verification via mobile authentication apps.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {twoFactor && (
                                <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    Active Protection
                                </span>
                            )}
                            <Switch
                                checked={twoFactor}
                                onCheckedChange={setTwoFactor}
                                className="data-[state=checked]:bg-emerald-500"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-red-500/20 bg-red-500/5 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500 rounded-lg text-white">
                            <AlertTriangle size={18} />
                        </div>
                        <CardTitle className="text-xl font-black text-red-600">Danger Zone</CardTitle>
                    </div>
                    <CardDescription className="font-medium text-red-600/70">Critical actions that cannot be reversed. Use with caution.</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white/40 rounded-2xl border border-red-100">
                        <div className="space-y-1">
                            <p className="font-black text-zinc-900">Delete Account</p>
                            <p className="text-sm text-zinc-500 font-medium">Permanently wipe all your courses, history, and records.</p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-red-500/10">Delete Account</Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl border-2 border-white/50 bg-white/95 backdrop-blur-2xl max-w-md">
                                <DialogHeader className="pt-6">
                                    <DialogTitle className="text-2xl font-black text-zinc-900">Final Confirmation</DialogTitle>
                                    <DialogDescription className="text-zinc-500 font-medium pt-2">
                                        This action is irreversible. All your progress, certificates, and course access will be permanently lost.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="pb-6 pt-4 gap-3">
                                    <Button variant="outline" className="rounded-xl h-12 flex-1 font-bold">CANCEL</Button>
                                    <Button variant="destructive" className="rounded-xl h-12 flex-1 font-bold">YES, DELETE</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
