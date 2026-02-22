
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Loader2, ExternalLink } from "lucide-react";
import { LiveClassRoom } from "./LiveClassRoom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface JoinLiveClassProps {
    courseId: string;
    isEnrolled: boolean;
    isLive?: boolean;              // Show 🔴 LIVE badge if class is active
    fallbackLink?: string;         // Fallback if token fails (plain link)
}

export function JoinLiveClass({
    courseId,
    isEnrolled,
    isLive = false,
    fallbackLink,
}: JoinLiveClassProps) {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [roomData, setRoomData] = useState<{ roomName: string; token: string; domain: string } | null>(null);

    const handleJoin = async () => {
        if (!isEnrolled) {
            toast.error("Please enroll in this course first to join the live class.");
            return;
        }
        if (!token) {
            toast.error("Please log in to join the live class.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`/courses/${courseId}/live/token`, {}, token);
            setRoomData(res.data ?? res);
        } catch {
            toast.error("Could not connect to live class. Trying direct link…");
            if (fallbackLink) window.open(fallbackLink, "_blank");
        } finally {
            setLoading(false);
        }
    };

    if (roomData) {
        return (
            <LiveClassRoom
                roomName={roomData.roomName}
                token={roomData.token}
                domain={roomData.domain}
                displayName={(user as { name?: string })?.name || "Student"}
                isInstructor={false}
                onClose={() => setRoomData(null)}
            />
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
            {isLive && (
                <Badge variant="destructive" className="gap-1.5 text-sm animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white inline-block" />
                    🔴 LIVE RIGHT NOW
                </Badge>
            )}

            <div className="text-center">
                <h3 className="font-semibold text-lg">Live Class Session</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {isEnrolled
                        ? "Click below to join the live class directly in your browser — no downloads needed."
                        : "Enroll in this course to access live classes."}
                </p>
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
                <Button
                    onClick={handleJoin}
                    disabled={loading || !isEnrolled}
                    size="lg"
                    className="gap-2 min-w-[180px]"
                >
                    {loading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</>
                    ) : (
                        <><Video className="h-4 w-4" /> Join Live Class</>
                    )}
                </Button>

                {fallbackLink && (
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => window.open(fallbackLink, "_blank")}
                        className="gap-2"
                    >
                        <ExternalLink className="h-4 w-4" /> Open in {fallbackLink.includes("zoom") ? "Zoom" : "Browser"}
                    </Button>
                )}
            </div>

            {isEnrolled && (
                <p className="text-xs text-muted-foreground text-center">
                    You&apos;re joining as <strong>{(user as { name?: string })?.name || "Student"}</strong> — your registered identity
                </p>
            )}
        </div>
    );
}
