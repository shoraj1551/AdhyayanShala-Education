"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { GraduationCap, LayoutDashboard, ShieldCheck, UserCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AuthSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { api } from "@/lib/api";

export function AuthSelectionModal({ isOpen, onClose }: AuthSelectionModalProps) {
    const router = useRouter();
    const { login, logout } = useAuth(); // Assuming login logic handles token setting

    const handleGuestLogin = async () => {
        try {
            logout(false); // Silent logout (no redirect)
            const res = await api.post("/auth/guest");
            login(res.token, res.user);
            onClose();
            // login() redirects to /dashboard, which is fine for now.
        } catch (err) {
            console.error("Guest login failed", err);
        }
    };

    const cards = [
        {
            role: "Student",
            icon: GraduationCap,
            description: "Join courses, track progress, and earn certificates.",
            color: "from-blue-600 to-indigo-600",
            border: "hover:border-blue-500/50",
            link: "/login?role=student",
            register: "/register?role=student",
        },
        {
            role: "Instructor",
            icon: LayoutDashboard,
            description: "Create courses, manage students, and earn revenue.",
            color: "from-emerald-600 to-teal-600",
            border: "hover:border-emerald-500/50",
            link: "/login?role=instructor",
            register: "/register?role=instructor",
        },
        {
            role: "Admin",
            icon: ShieldCheck,
            description: "Manage platform settings and content moderation.",
            color: "from-rose-600 to-orange-600",
            border: "hover:border-rose-500/50",
            link: "/login?role=admin",
            register: null, // Admin usually created manually
        },
        {
            role: "Guest",
            icon: UserCircle2,
            description: "Browse the course catalog freely before joining.",
            color: "from-zinc-600 to-slate-600",
            border: "hover:border-zinc-500/50",
            action: handleGuestLogin,
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl bg-zinc-950/90 backdrop-blur-xl border-white/10 p-0 overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="absolute inset-0 bg-grid-white/5 mask-image-gradient-b pointer-events-none" />

                <div className="p-8">
                    <DialogHeader className="mb-8 text-center relative z-10">
                        <DialogTitle className="text-3xl font-bold text-white drop-shadow-md">
                            Choose Your Journey
                        </DialogTitle>
                        <DialogDescription className="text-lg text-zinc-400 mt-2">
                            Select how you want to interact with AdhyayanShala Education
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {cards.map((card, index) => (
                            <motion.div
                                key={card.role}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative group overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60 p-6 transition-all duration-300 ${card.border} hover:bg-zinc-900/80 hover:scale-[1.01] hover:shadow-xl`}
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${card.color}`} />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} w-fit ring-1 ring-white/10 text-white shadow-lg`}>
                                            <card.icon className="w-8 h-8" />
                                        </div>
                                        {card.role !== "Guest" && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-white/90 border border-white/10">Select</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="mt-4 text-xl font-bold text-white mb-2 tracking-tight">{card.role}</h3>
                                    <p className="text-sm text-zinc-400 mb-6 min-h-[40px] leading-relaxed">{card.description}</p>

                                    <div className="flex gap-3">
                                        {card.action ? (
                                            <Button
                                                onClick={card.action}
                                                variant="secondary"
                                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 transition-colors"
                                            >
                                                Continue as Guest
                                            </Button>
                                        ) : (
                                            <>
                                                <Link href={card.link} className="flex-1">
                                                    <Button variant="ghost" className="w-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors">
                                                        Login
                                                    </Button>
                                                </Link>
                                                {card.register && (
                                                    <Link href={card.register} className="flex-1">
                                                        <Button className={`w-full bg-gradient-to-r ${card.color} text-white shadow-lg hover:opacity-90 border-0 transition-opacity`}>
                                                            Register
                                                        </Button>
                                                    </Link>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
