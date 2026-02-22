
"use client";

import { useState, useRef, useCallback } from "react";
import { LiveClassRoom } from "./LiveClassRoom";
import { Whiteboard } from "./Whiteboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, PanelLeft, PanelRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface InstructorClassRoomProps {
    courseId: string;
    roomName: string;
    token: string;
    domain?: string;
    instructorName: string;
    authToken: string;
    onClose: () => void;
}

type Layout = "split" | "video-only" | "board-only";

export function InstructorClassRoom({
    courseId,
    roomName,
    token,
    domain,
    instructorName,
    authToken,
    onClose,
}: InstructorClassRoomProps) {
    const [recording, setRecording] = useState(false);
    const [layout, setLayout] = useState<Layout>("split");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // ── Recording ──────────────────────────────────────────────────────────────
    const handleRecordingStop = useCallback(async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const file = new File([blob], `class-recording-${Date.now()}.webm`, { type: "video/webm" });

        toast.loading("Uploading recording…", { id: "rec-upload" });
        try {
            const res = await api.upload(file, authToken);
            await api.post(`/courses/${courseId}/live/recording`, {
                url: res.url,
                title: `Class Recording – ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
            }, authToken);
            toast.success("✅ Recording saved to course page!", { id: "rec-upload" });
        } catch {
            toast.error("Failed to upload recording. Downloading locally…", { id: "rec-upload" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = file.name; a.click();
        }
    }, [courseId, authToken]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
            const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
            chunksRef.current = [];
            mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = handleRecordingStop;
            mr.start(1000);
            mediaRecorderRef.current = mr;
            setRecording(true);
            toast.success("🔴 Recording started");
        } catch {
            toast.error("Could not start recording. Please allow screen sharing.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
        setRecording(false);
    };

    // ── Notes save ─────────────────────────────────────────────────────────────
    const handleSaveNotes = async (dataUrl: string) => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `notes-${Date.now()}.png`, { type: "image/png" });
        const upload = await api.upload(file, authToken);
        await api.post(`/courses/${courseId}/live/notes`, {
            url: upload.url,
            title: `Class Notes – ${new Date().toLocaleDateString("en-IN")}`,
        }, authToken);
    };

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
            {/* ── Instructor Toolbar ── */}
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white font-bold text-sm">TEACHING MODE</span>
                </div>

                {/* Layout toggles */}
                <div className="flex items-center gap-1 ml-2 border border-zinc-700 rounded-lg p-1">
                    <button
                        title="Video only"
                        onClick={() => setLayout("video-only")}
                        className={cn("p-1.5 rounded", layout === "video-only" ? "bg-primary text-primary-foreground" : "text-zinc-400 hover:text-white")}
                    >
                        <PanelRight className="h-4 w-4" />
                    </button>
                    <button
                        title="Split view"
                        onClick={() => setLayout("split")}
                        className={cn("p-1.5 rounded text-xs font-bold px-1", layout === "split" ? "bg-primary text-primary-foreground" : "text-zinc-400 hover:text-white")}
                    >
                        ⊟
                    </button>
                    <button
                        title="Whiteboard only"
                        onClick={() => setLayout("board-only")}
                        className={cn("p-1.5 rounded", layout === "board-only" ? "bg-primary text-primary-foreground" : "text-zinc-400 hover:text-white")}
                    >
                        <PanelLeft className="h-4 w-4" />
                    </button>
                </div>

                {/* Record + End */}
                <div className="ml-auto flex items-center gap-2">
                    {recording ? (
                        <>
                            <Badge variant="destructive" className="animate-pulse gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> REC
                            </Badge>
                            <Button size="sm" variant="destructive" onClick={stopRecording} className="gap-1.5">
                                <Video className="h-4 w-4" /> Stop Recording
                            </Button>
                        </>
                    ) : (
                        <Button size="sm" variant="outline" onClick={startRecording} className="border-zinc-600 text-zinc-300 hover:text-white gap-1.5">
                            <Video className="h-4 w-4" /> Record Class
                        </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={onClose}>End Class</Button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 flex overflow-hidden">
                {layout !== "board-only" && (
                    <div className={cn("flex flex-col", layout === "split" ? "w-1/2 border-r border-zinc-800" : "w-full")}>
                        <LiveClassRoom
                            roomName={roomName}
                            token={token}
                            domain={domain}
                            displayName={instructorName}
                            isInstructor
                            onClose={onClose}
                        />
                    </div>
                )}

                {layout !== "video-only" && (
                    <div className={cn("flex flex-col", layout === "split" ? "w-1/2" : "w-full")}>
                        <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-700 text-xs text-zinc-400 shrink-0">
                            📝 Notes auto-save when you click &quot;Save Notes&quot; — students can download them after class.
                        </div>
                        <Whiteboard onSave={handleSaveNotes} className="flex-1 rounded-none border-0" />
                    </div>
                )}
            </div>
        </div>
    );
}
