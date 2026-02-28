"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddUserPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "INSTRUCTOR" as "STUDENT" | "INSTRUCTOR" | "ADMIN"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/admin/users", formData, token);
            toast.success("User created successfully");
            router.push("/admin/users");
        } catch (error: any) {
            toast.error(error.data?.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
                    <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest mt-1">Manual Account Setup</p>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Account Details
                    </CardTitle>
                    <CardDescription>Enter the basic information for the new user. They will be able to log in with these credentials immediately.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="h-11 rounded-lg border-zinc-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="h-11 rounded-lg border-zinc-200"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">User Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(val: any) => setFormData({ ...formData, role: val })}
                                >
                                    <SelectTrigger className="h-11 rounded-lg border-zinc-200">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STUDENT">Student</SelectItem>
                                        <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                                        <SelectItem value="ADMIN">Administrator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Login Password</Label>
                                <Input
                                    id="password"
                                    type="text"
                                    placeholder="Set temporary password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="h-11 rounded-lg border-zinc-200"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-6 border-t bg-zinc-50/50 dark:bg-zinc-800/50 rounded-b-xl">
                        <div className="flex w-full items-center justify-between">
                            <Link href="/admin/users">
                                <Button variant="ghost" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit" className="px-10 h-11 bg-zinc-900 hover:bg-primary transition-all font-bold" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                CREATE USER ACCOUNT
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
