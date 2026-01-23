"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Settings,
    LogOut,
    Library,
    History
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Browse Courses",
        href: "/courses",
        icon: Library,
    },
    {
        title: "My Learning",
        href: "/my-learning",
        icon: GraduationCap,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
    {
        title: "History",
        href: "/history",
        icon: History,
    },
    {
        title: "Admin (Tests)",
        href: "/admin/tests",
        icon: Settings,
    },
    {
        title: "Create Course",
        href: "/instructor/create",
        icon: BookOpen,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    return (
        <div className="flex h-full min-h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <BookOpen className="h-6 w-6" />
                    <span>Shoraj</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        // Guest Logic
                        if (!user) {
                            if (item.title !== "Browse Courses") return null;
                        } else {
                            // Auth Logic
                            if (item.title.startsWith("Admin") && user.role !== 'ADMIN') {
                                return null;
                            }
                            if (item.title === "Create Course" && user.role === 'STUDENT') {
                                return null;
                            }
                        }

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                {user ? (
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                ) : (
                    <Link
                        href="/login"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                        <LogOut className="h-4 w-4 rotate-180" />
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    );
}
