"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertCircle, GraduationCap, LayoutDashboard } from "lucide-react";

function RegisterForm() {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role");
    const role = (roleParam === "instructor") ? "instructor" : "student"; // Default to student, strict check

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const res = await api.post("/auth/register", { email, password, name, role });
            login(res.token, res.user);
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                    {role === 'instructor' ? (
                        <div className="bg-emerald-500/10 p-3 rounded-full text-emerald-500">
                            <LayoutDashboard className="w-8 h-8" />
                        </div>
                    ) : (
                        <div className="bg-blue-500/10 p-3 rounded-full text-blue-500">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                    )}
                </div>
                <CardTitle className="text-2xl text-center font-bold">
                    Create {role === 'instructor' ? 'Instructor' : 'Student'} Account
                </CardTitle>
                <CardDescription className="text-center">
                    Enter your details below to join as a {role}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link href={`/login?role=${role}`} className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
