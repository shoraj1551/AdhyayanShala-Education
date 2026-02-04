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
    History,
    Plus,
    IndianRupee,
    TrendingUp
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const commonItems = [
    { title: "Settings", href: "/settings", icon: Settings },
];

const studentItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Browse Courses", href: "/courses", icon: Library },
    { title: "My Learning", href: "/my-learning", icon: GraduationCap },
    { title: "History", href: "/history", icon: History },
    ...commonItems
];

const instructorItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "My Courses", href: "/instructor/courses", icon: BookOpen },
    { title: "Create Course", href: "/instructor/create", icon: Plus },
    { title: "Earnings & Payouts", href: "/instructor/finance", icon: IndianRupee },
    { title: "Market Research", href: "/courses", icon: Library }, // Replaced Browse Courses
    ...commonItems
];

const adminItems = [
    { title: "Admin Overview", href: "/dashboard", icon: LayoutDashboard },
    { title: "Analytics", href: "/admin/analytics", icon: TrendingUp },
    { title: "Platform Content", href: "/admin/courses", icon: Library },
    { title: "User Management", href: "/admin/users", icon: BookOpen },
    { title: "Financial Control", href: "/admin/finance", icon: IndianRupee },
    { title: "Payout Requests", href: "/admin/payouts", icon: IndianRupee },
    { title: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    let items = studentItems; // default
    if (!user) {
        items = [{ title: "Browse Courses", href: "/courses", icon: Library }];
    } else if (user.role === 'INSTRUCTOR') {
        items = instructorItems;
    } else if (user.role === 'ADMIN') {
        items = adminItems;
    }

    return (
        <div className="flex h-full min-h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <img src="/logo.png" alt="AdhyayanShala" className="h-8 w-8 object-contain" />
                    <span>AdhyayanShala</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

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
                        onClick={() => logout()}
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
