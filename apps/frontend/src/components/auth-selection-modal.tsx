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

export function AuthSelectionModal({ isOpen, onClose }: AuthSelectionModalProps) {
    const router = useRouter();
    const { login } = useAuth();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl bg-background/95 backdrop-blur-xl border-border p-0 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-grid-primary/5 mask-image-gradient-b pointer-events-none" />

                <div className="p-8 relative z-10">
                    <DialogHeader className="mb-8 text-center">
                        <DialogTitle className="text-3xl font-bold tracking-tight">
                            Welcome to AdhyayanShala
                        </DialogTitle>
                        <DialogDescription className="text-lg text-muted-foreground mt-2">
                            Choose your role to continue
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center justify-center">

                        {/* Instructor - Smaller */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="group relative overflow-hidden rounded-xl border bg-card p-5 hover:border-primary/50 transition-all hover:shadow-lg md:scale-90"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50">
                                    <LayoutDashboard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Instructor</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Teach and earn</p>
                                </div>
                                <div className="w-full flex gap-2">
                                    <Link href="/login?role=instructor" className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">Login</Button>
                                    </Link>
                                    <Link href="/register?role=instructor" className="flex-1">
                                        <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                                            Register
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Student - Highlighted & Larger */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative overflow-hidden rounded-2xl border-2 border-primary bg-card p-8 shadow-2xl z-20 md:scale-110"
                        >
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                Recommended
                            </div>
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="p-4 rounded-full bg-blue-100 text-blue-600 ring-8 ring-blue-50 shadow-sm">
                                    <GraduationCap className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-2xl text-primary">Student</h3>
                                    <p className="text-muted-foreground mt-2">Access courses & build skills</p>
                                </div>
                                <div className="w-full space-y-3">
                                    <Link href="/login?role=student" className="block">
                                        <Button className="w-full text-lg h-12 shadow-blue-200 shadow-lg" size="lg">
                                            Student Login <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        New here? <Link href="/register?role=student" className="text-primary hover:underline font-semibold">Create an account</Link>
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Admin - Smaller */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="group relative overflow-hidden rounded-xl border bg-card p-5 hover:border-primary/50 transition-all hover:shadow-lg md:scale-90"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-3 rounded-full bg-rose-100 text-rose-600 ring-4 ring-rose-50">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Admin</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Platform control</p>
                                </div>
                                <div className="w-full flex gap-2">
                                    <Link href="/login?role=admin" className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">Login</Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
