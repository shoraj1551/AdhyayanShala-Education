"use client";

import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";

export function Topbar() {
    const { user } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-foreground">
                    Welcome back, {user?.name?.split(" ")[0] || "Student"}!
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-sm">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-card-foreground">{user?.email}</span>
                </div>
            </div>
        </header>
    );
}
