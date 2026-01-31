"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Menu, LayoutDashboard, Library, GraduationCap, Settings, History, BookOpen, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Browse Courses", href: "/courses", icon: Library },
    { title: "My Learning", href: "/my-learning", icon: GraduationCap },
    { title: "Settings", href: "/settings", icon: Settings },
    { title: "History", href: "/history", icon: History },
    { title: "Admin (Tests)", href: "/admin/tests", icon: Settings },
    { title: "Create Course", href: "/instructor/create", icon: BookOpen },
];

export function Topbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6" />

                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                        <nav className="flex flex-col gap-4 mt-8">
                            <div className="flex items-center gap-2 font-bold text-xl text-primary px-2 mb-4">
                                <img src="/logo.png" alt="AdhyayanShala" className="h-8 w-8 object-contain" />
                                <span>AdhyayanShala</span>
                            </div>
                            {sidebarItems.map((item, index) => {
                                if (item.title === "Create Course" && user?.role === 'STUDENT') return null;
                                if (item.title.startsWith("Admin") && user?.role !== 'ADMIN') return null;

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
                            <div className="border-t pt-4 mt-auto">
                                <button
                                    onClick={() => logout()}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </nav>
                    </SheetContent>
                </Sheet>

                <h1 className="text-lg font-semibold text-foreground hidden md:block">
                    Welcome back, {user?.name?.split(" ")[0] || "Student"}!
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-sm">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-card-foreground hidden sm:inline-block">{user?.email}</span>
                </div>
            </div>
        </header >
    );
}
