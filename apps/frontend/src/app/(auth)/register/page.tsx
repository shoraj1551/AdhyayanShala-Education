"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, GraduationCap, LayoutDashboard, ShieldCheck, UserPlus, Briefcase, Linkedin, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DEFAULT_INTERESTS, DEFAULT_STUDENT_STATUSES, INSTRUCTOR_EXPERTISE_OPTIONS } from "@/lib/constants";

function RegisterForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const roleParam = searchParams.get("role");
    // Admin cannot register publicly
    const role = (roleParam === "instructor") ? "instructor" : (roleParam === "admin" ? "admin" : "student");
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1);
    const isStudent = role === "student";
    const isInstructor = role === "instructor";
    const isAdmin = role === "admin";

    // Dynamic Options State
    const [studentStatuses, setStudentStatuses] = useState(DEFAULT_STUDENT_STATUSES);
    const [interestOptions, setInterestOptions] = useState(DEFAULT_INTERESTS);
    const [expertiseOptions, setExpertiseOptions] = useState(INSTRUCTOR_EXPERTISE_OPTIONS);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Expanded API to fetch instructor options if needed
                const res = await api.get('/auth/registration-options');
                if (res.statuses) setStudentStatuses(res.statuses);
                if (res.interests) setInterestOptions(res.interests);
                // if (res.expertise) setExpertiseOptions(res.expertise);
            } catch (error) {
                // defaults
            }
        };
        fetchOptions();
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        currentStatus: "",
        interests: "",
        // Instructor specific
        expertise: "",
        experience: "",
        linkedin: "",
        bio: ""
    });

    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState<React.ReactNode>("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                role: role.toUpperCase()
            };
            const res = await api.post("/auth/register", payload);
            // login(res.token, res.user); // Removed auto-login
            toast.success("Account created successfully!", {
                description: "Be ready with your credentials. Redirecting to login..."
            });
            setTimeout(() => {
                router.push(`/login?role=${role}`);
            }, 1500);
        } catch (err: any) {
            console.error("Registration error full object:", err);
            // ... existing logging ...
            console.error("Registration error data:", err.data);

            if (err.data?.errors && Array.isArray(err.data.errors)) {
                // Zod errors
                const errorList = (
                    <ul className="list-disc pl-4 space-y-1 text-left">
                        {err.data.errors.map((e: any, i: number) => (
                            <li key={i}>
                                {e.path ? <span className="font-semibold capitalize">{e.path.join('.')}: </span> : null}
                                {e.message}
                            </li>
                        ))}
                    </ul>
                );
                setError(errorList);
            } else if (err.data?.message) {
                // Explicit message from backend data
                setError(err.data.message);
            } else {
                // Fallback to error object message
                setError(err.message || "Registration failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ... inside render ...



    const getIcon = () => {
        switch (role) {
            case "admin": return ShieldCheck;
            case "instructor": return LayoutDashboard;
            case "student": return GraduationCap;
            default: return UserPlus;
        }
    };

    const Icon = getIcon();

    if (isAdmin) {
        return (
            <Card className="border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-rose-500/10 ring-rose-500/20 text-rose-500 p-3 rounded-full ring-1">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Admin Access Restricted</CardTitle>
                    <CardDescription className="text-zinc-400 mt-2">
                        Administrators cannot create accounts publicly. <br />
                        Please contact the system owner for credentials.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center pb-6">
                    <Button variant="outline" asChild>
                        <Link href="/login?role=admin">Return to Admin Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl transition-all duration-500 w-full",
            (isStudent || isInstructor) ? "max-w-lg" : "max-w-md"
        )}>
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className={cn(
                        "p-3 rounded-full ring-1 shadow-lg transition-colors",
                        isInstructor ? "bg-emerald-500/10 ring-emerald-500/20 text-emerald-500" :
                            isStudent ? "bg-blue-500/10 ring-blue-500/20 text-blue-500" :
                                "bg-primary/10 ring-primary/20 text-primary"
                    )}>
                        <Icon className="h-8 w-8" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    Create {displayRole} Account
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    {isInstructor
                        ? "Join our faculty to start teaching and earning"
                        : "Tell us a bit about yourself to personalize your journey"}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="flex-1">{error}</div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                            className="bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                required
                                className="bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-zinc-300">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className="bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    {isStudent && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">I am a</Label>
                                <Select onValueChange={(val) => handleChange("currentStatus", val)}>
                                    <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {studentStatuses.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Interested In</Label>
                                <Select onValueChange={(val) => handleChange("interests", val)}>
                                    <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white">
                                        <SelectValue placeholder="Select Topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {interestOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {isInstructor && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Key Expertise</Label>
                                    <Select onValueChange={(val) => handleChange("expertise", val)}>
                                        <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white">
                                            <SelectValue placeholder="Select Domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expertiseOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Experience (Years)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 5"
                                        value={formData.experience}
                                        onChange={(e) => handleChange("experience", e.target.value)}
                                        className="bg-zinc-950/50 border-white/10 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300">LinkedIn Profile (Optional)</Label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="https://linkedin.com/in/..."
                                        className="pl-9 bg-zinc-950/50 border-white/10 text-white"
                                        value={formData.linkedin}
                                        onChange={(e) => handleChange("linkedin", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-300">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 6 characters"
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    required
                                    minLength={6}
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
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-zinc-950/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-zinc-500 hover:text-zinc-300"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Button
                        className={cn(
                            "w-full text-white transition-colors font-semibold shadow-lg mt-2",
                            isInstructor ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20" :
                                "bg-primary hover:bg-primary/90"
                        )}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                            </>
                        ) : "Create Account"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-0 pb-6">
                <div className="relative w-full mb-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-zinc-900 px-2 text-zinc-400">
                            Or
                        </span>
                    </div>
                </div>
                <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link href={`/login?role=${role}`} className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors">
                        Sign in
                    </Link>
                </div>
                <div className="text-center mt-2">
                    <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
                        Back to Home
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function RegisterPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950 bg-[url('/hero-bg.png')] bg-cover bg-center overflow-y-auto py-10">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm fixed" />
            <div className="relative z-10 w-full px-4 animate-in fade-in zoom-in-95 duration-500 flex justify-center my-auto">
                <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                    <RegisterForm />
                </Suspense>
            </div>
        </div>
    );
}
