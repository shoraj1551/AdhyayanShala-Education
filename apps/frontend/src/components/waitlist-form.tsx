"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { joinWaitlist } from "@/lib/api";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export function WaitlistForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await joinWaitlist(email);
            setIsSuccess(true);
            toast.success("You're on the list!", {
                description: "Check your email for confirmation."
            });
            setEmail("");
            // Reset success state after a few seconds so they can enter another if they want
            setTimeout(() => setIsSuccess(false), 5000);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to join waitlist.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex items-center gap-3 bg-white/10 text-white px-6 py-4 rounded-md border border-white/20 animate-in fade-in slide-in-from-bottom-2 mx-auto w-full max-w-md">
                <CheckCircle2 className="text-green-400 h-5 w-5" />
                <span className="font-medium text-left">Thanks for joining! We&apos;ll be in touch soon.</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
            <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-400"
                    disabled={isLoading}
                />
            </div>
            <Button
                type="submit"
                className="bg-white text-indigo-950 hover:bg-white/90 font-bold whitespace-nowrap"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Waitlist"}
            </Button>
        </form>
    );
}
