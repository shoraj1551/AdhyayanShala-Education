"use client";

import { useAuth } from "@/context/AuthContext";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { InstructorDashboard } from "@/components/dashboard/instructor-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const { user, token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    // Guest View
    if (user.role === 'GUEST') {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-6 flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400">
                        <ArrowRight className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-indigo-400">You are browsing as a Guest</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your progress is temporary.
                            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 ml-1 font-medium underline underline-offset-4">
                                Create an account to save progress.
                            </Link>
                        </p>
                    </div>
                </div>
                <StudentDashboard user={user} token={token} />
            </div>
        );
    }

    // Role-based Layouts
    const normalizedRole = user.role?.toLowerCase();

    if (normalizedRole === 'admin') {
        return <AdminDashboard user={user} />;
    }

    if (normalizedRole === 'instructor') {
        return <InstructorDashboard user={user} />;
    }

    // Default to Student
    return <StudentDashboard user={user} token={token} />;
}
