"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Command, ShieldCheck, GraduationCap, LayoutDashboard, Send, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is set up as per previous context

function LoginForm() {
    const searchParams = useSearchParams();
    const role = searchParams.get("role");

    // Capitalize role for display
    const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";
    const isSecurityRequired = role === "instructor" || role === "admin";

    const [identifier, setIdentifier] = useState(""); // Email or Mobile
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // OTP Logic
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const { login } = useAuth();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const handleSendOtp = () => {
        if (!identifier) {
            setError("Please enter your Email or Mobile Number first.");
            return;
        }
        setError("");
        setIsSendingOtp(true);

        // Simulate API call
        setTimeout(() => {
            setIsSendingOtp(false);
            setOtpSent(true);
            setOtpTimer(30); // 30 seconds cooldown
            toast.success("OTP Sent!", {
                description: "Use code 123456 to verify (Demo Mode)."
            });
            // Pre-fill for convenience if desired, or just let them type it.
            // setOtp("123456"); 
        }, 1500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (isSecurityRequired && !otp) {
            setError("Security Code (OTP) is required for " + displayRole + " login.");
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                email: identifier, // Backend expects 'email'
                password,
                role, // Backend might ignore this but good for context if updated later
                ...(isSecurityRequired && { otp })
            };

            const res = await api.post("/auth/login", payload);
            login(res.token, res.user);
        } catch (err: any) {
            console.error("Login error:", err);
            // Prioritize specific validation errors (Zod)
            if (err.data?.errors && Array.isArray(err.data.errors)) {
                setError(err.data.errors.map((e: any) => e.message).join(", "));
            } else if (err.data?.message) {
                setError(err.data.message);
            } else {
                setError(err.message || "Invalid credentials");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = () => {
        switch (role) {
            case "admin": return ShieldCheck;
            case "instructor": return LayoutDashboard;
            case "student": return GraduationCap;
            default: return Command;
        }
    };

    const Icon = getIcon();

    return (
        <Card className="border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl transition-all duration-500">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className={cn(
                        "p-3 rounded-full ring-1 shadow-lg transition-colors",
                        role === 'admin' ? "bg-rose-500/10 ring-rose-500/20 text-rose-500" :
                            role === 'instructor' ? "bg-emerald-500/10 ring-emerald-500/20 text-emerald-500" :
                                role === 'student' ? "bg-blue-500/10 ring-blue-500/20 text-blue-500" :
                                    "bg-primary/10 ring-primary/20 text-primary"
                    )}>
                        <Icon className="h-8 w-8" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    {displayRole ? `${displayRole} Login` : "Welcome back"}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    {isSecurityRequired
                        ? "Enter your credentials and security code."
                        : "Enter your credentials to access your account."}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="identifier" className="text-zinc-300">Email or Mobile Number</Label>
                        <Input
                            id="identifier"
                            placeholder="name@example.com or 9876543210"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect="off"
                            disabled={isLoading}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-300">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                autoCapitalize="none"
                                autoComplete="current-password"
                                disabled={isLoading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-zinc-500 hover:text-zinc-300"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                                <span className="sr-only">Toggle password visibility</span>
                            </Button>
                        </div>
                    </div>

                    {isSecurityRequired && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="otp" className="text-zinc-300">Security Code (OTP)</Label>
                                {otpSent && <span className="text-xs text-emerald-400">OTP Sent!</span>}
                            </div>

                            <div className="relative flex gap-2">
                                <Input
                                    id="otp"
                                    placeholder="123456"
                                    type="text"
                                    maxLength={6}
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    disabled={isLoading}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary tracking-widest text-center font-mono"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="shrink-0 bg-white/10 hover:bg-white/20 text-white border-white/10"
                                    onClick={handleSendOtp}
                                    disabled={isSendingOtp || otpTimer > 0 || !identifier}
                                >
                                    {isSendingOtp ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        otpTimer > 0 ? `${otpTimer}s` : (otpSent ? "Resend" : "Send OTP")
                                    )}
                                </Button>
                            </div>
                            <p className="text-[10px] text-zinc-500 text-right">
                                {otpSent ? "Did not receive? Check spam or resend." : "Click send to verify device."}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button
                        className={cn(
                            "w-full text-white transition-colors font-semibold shadow-lg",
                            role === 'admin' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-900/20" :
                                role === 'instructor' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20" :
                                    role === 'student' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-900/20" :
                                        "bg-primary hover:bg-primary/90"
                        )}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-zinc-900 px-2 text-zinc-400">
                            Or
                        </span>
                    </div>
                </div>

                <Button variant="outline" type="button" disabled={isLoading} asChild className="w-full border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white">
                    <Link href={`/register?role=${role || 'student'}`}>Create new account</Link>
                </Button>

                <div className="text-center">
                    <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
                        Back to Home
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950 bg-[url('/hero-bg.png')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in zoom-in-95 duration-500">
                <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
