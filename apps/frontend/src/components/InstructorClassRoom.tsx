
"use client";

import { useState, useRef, useCallback, useEffect, type ChangeEvent } from "react";
import { LiveClassRoom } from "./LiveClassRoom";
import { Whiteboard } from "./Whiteboard";
import { ResourcesPanel } from "./ResourcesPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, PanelLeft, PanelRight, BookOpen, LayoutGrid, Trash2, FileText } from "lucide-react";
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
    brochureUrl?: string;
    onClose: () => void;
}

type Layout = "split" | "video-only" | "board-only" | "pdf-only" | "pdf-board";

export function InstructorClassRoom({
    courseId,
    roomName,
    token,
    domain,
    instructorName,
    authToken,
    brochureUrl,
    onClose,
}: InstructorClassRoomProps) {
    const [recording, setRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [layout, setLayout] = useState<Layout>("split");
    const [showResources, setShowResources] = useState(false);
    const [currentPdf, setCurrentPdf] = useState<string | null>(null);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setRecording(false);
        setRecordingSeconds(0);
    }, []);

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
            setRecordingSeconds(0);

            timerRef.current = setInterval(() => {
                setRecordingSeconds(prev => prev + 1);
            }, 1000);

            toast.success("🔴 Recording started");
        } catch {
            toast.error("Could not start recording. Please allow screen sharing.");
        }
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

    const handlePdfUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== "application/pdf") {
            toast.error("Please select a valid PDF file");
            return;
        }

        setUploadingPdf(true);
        toast.loading("Uploading PDF...", { id: "pdf-upload" });

        try {
            const res = await api.upload(file, authToken);
            setCurrentPdf(res.url);
            setLayout("pdf-board");
            toast.success("PDF uploaded and shared!", { id: "pdf-upload" });
        } catch (error) {
            console.error("PDF Upload Failed:", error);
            toast.error("Failed to upload PDF", { id: "pdf-upload" });
        } finally {
            setUploadingPdf(false);
        }
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
                    <button
                        title="PDF sharing"
                        onClick={() => setLayout("pdf-board")}
                        className={cn("p-1.5 rounded text-xs px-2 font-bold", layout === "pdf-board" ? "bg-primary text-primary-foreground" : "text-zinc-400 hover:text-white")}
                    >
                        PDF BOARD
                    </button>
                    {currentPdf && (
                        <button
                            title="Reset PDF"
                            onClick={() => setCurrentPdf(null)}
                            className="p-1.5 text-red-400 hover:bg-zinc-800 rounded"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Resources */}
                <Button
                    size="sm"
                    variant={showResources ? "default" : "outline"}
                    onClick={() => setShowResources(!showResources)}
                    className="gap-1.5 border-zinc-700"
                >
                    <BookOpen className="h-4 w-4" /> Teaching Resources
                </Button>

                {/* Record + End */}
                <div className="ml-auto flex items-center gap-2">
                    {recording ? (
                        <>
                            <Badge variant="destructive" className="animate-pulse gap-1.5 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                                REC {new Date(recordingSeconds * 1000).toISOString().slice(11, 19)}
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
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to end this class for everyone?")) {
                                if (recording) stopRecording();
                                onClose();
                            }
                        }}
                    >
                        End Class
                    </Button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 flex overflow-hidden">
                {layout !== "board-only" && layout !== "pdf-only" && (
                    <div className={cn("flex flex-col", (layout === "split" || layout === "pdf-board") ? "w-1/4 border-r border-zinc-800 shrink-0" : "w-full")}>
                        <LiveClassRoom
                            roomName={roomName}
                            token={token}
                            domain={domain}
                            displayName={instructorName}
                            isInstructor
                            embedded={true}
                            onClose={onClose}
                        />
                        <div className="absolute bottom-4 left-4 z-20 pointer-events-none opacity-60">
                            <Badge variant="outline" className="bg-zinc-900/80 text-[10px] gap-1 px-2 py-0.5 border-zinc-700">
                                <LayoutGrid className="h-3 w-3" /> Tip: Click &quot;Tile View&quot; for Gallery
                            </Badge>
                        </div>
                    </div>
                )}

                {layout !== "video-only" && (
                    <div className={cn("flex flex-col relative", layout === "split" ? "flex-1" : layout === "pdf-board" ? "w-2/5 border-r border-zinc-800" : "w-full")}>
                        <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-700 text-xs text-zinc-400 shrink-0 flex items-center justify-between">
                            <span>📝 Notes auto-save when you click &quot;Save Notes&quot; — students can download them after class.</span>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="text-[10px] border-zinc-700">
                                    {layout === "pdf-board" ? "Whiteboard Over PDF" : "Whiteboard Active"}
                                </Badge>
                            </div>
                        </div>

                        {/* Whiteboard with optional PDF background */}
                        <div className="flex-1 relative">
                            {layout === "pdf-board" && currentPdf && (
                                <iframe
                                    src={`${currentPdf}#toolbar=0`}
                                    className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                                    title="PDF Content"
                                />
                            )}
                            <Whiteboard
                                onSave={handleSaveNotes}
                                className={cn(
                                    "flex-1 rounded-none border-0 min-h-[800px]",
                                    layout === "pdf-board" ? "bg-transparent h-full" : "bg-[#1e1e2e]"
                                )}
                            />
                        </div>

                        {showResources && (
                            <div className="absolute inset-x-0 bottom-0 z-20 shadow-2xl animate-in slide-in-from-bottom duration-300">
                                <ResourcesPanel
                                    courseId={courseId}
                                    brochureUrl={brochureUrl}
                                    authToken={authToken}
                                    onSharePdf={(url) => {
                                        setCurrentPdf(url);
                                        setLayout("pdf-board");
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {(layout === "pdf-board" || layout === "pdf-only") && (
                    <div className={cn("flex flex-col", layout === "pdf-board" ? "flex-1" : "w-full")}>
                        {currentPdf ? (
                            <iframe
                                src={currentPdf}
                                className="w-full h-full border-0"
                                title="Main PDF Viewer"
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900 p-8 text-center space-y-4">
                                <FileText className="h-12 w-12 text-zinc-700 mb-2" />
                                <div>
                                    <p className="font-bold uppercase tracking-widest text-xs mb-1">No PDF Selected</p>
                                    <p className="text-[10px] text-zinc-600">Select a document from resources or upload a new one to start sharing.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-zinc-700 text-xs"
                                        onClick={() => setShowResources(true)}
                                    >
                                        <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Open Resources
                                    </Button>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handlePdfUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={uploadingPdf}
                                        />
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                                            disabled={uploadingPdf}
                                        >
                                            <FileText className="h-3.5 w-3.5 mr-1.5" /> {uploadingPdf ? "Uploading..." : "Upload PDF"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
