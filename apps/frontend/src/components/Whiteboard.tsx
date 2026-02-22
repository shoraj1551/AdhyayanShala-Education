
"use client";

import { useRef, useState, useCallback } from "react";
import {
    Pencil, Eraser, Square, Type, Trash2, Download,
    Circle, Minus, Undo2, Redo2, Save, ArrowUpRight,
    Triangle, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

type Tool = "pen" | "eraser" | "line" | "rect" | "circle" | "text" | "arrow" | "triangle";

interface WhiteboardProps {
    onSave?: (dataUrl: string) => Promise<void>;
    className?: string;
}

const COLORS = ["#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#000000"];
const SIZES = [2, 4, 8, 14, 22];

export function Whiteboard({ onSave, className }: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState("#ffffff");
    const [size, setSize] = useState(4);
    const [saving, setSaving] = useState(false);

    // Undo/redo history stored as ImageData snapshots
    const history = useRef<ImageData[]>([]);
    const future = useRef<ImageData[]>([]);
    const isDrawing = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });
    const snapshot = useRef<ImageData | null>(null);

    const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

    const saveHistory = useCallback(() => {
        const ctx = getCtx();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (history.current.length > 50) history.current.shift();
        future.current = [];
    }, []);

    const undo = () => {
        const ctx = getCtx(); const canvas = canvasRef.current;
        if (!ctx || !canvas || history.current.length === 0) return;
        future.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(history.current.pop()!, 0, 0);
    };

    const redo = () => {
        const ctx = getCtx(); const canvas = canvasRef.current;
        if (!ctx || !canvas || future.current.length === 0) return;
        history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(future.current.pop()!, 0, 0);
    };

    const clearCanvas = () => {
        const ctx = getCtx(); const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        saveHistory();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const scaleX = canvasRef.current!.width / rect.width;
        const scaleY = canvasRef.current!.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const ctx = getCtx();
        if (!ctx) return;
        isDrawing.current = true;
        const pos = getPos(e);
        lastPos.current = pos;
        startPos.current = pos;
        saveHistory();

        if (tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = size * 4;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        } else if (tool === "pen") {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            snapshot.current = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        }
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        const ctx = getCtx()!;
        const pos = getPos(e);
        ctx.strokeStyle = tool === "eraser" ? "#1e1e2e" : color;
        ctx.lineWidth = tool === "eraser" ? size * 4 : size;

        if (tool === "pen" || tool === "eraser") {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        } else if (snapshot.current) {
            ctx.globalCompositeOperation = "source-over";
            ctx.putImageData(snapshot.current, 0, 0);
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            if (tool === "line") {
                ctx.moveTo(startPos.current.x, startPos.current.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            } else if (tool === "rect") {
                ctx.strokeRect(startPos.current.x, startPos.current.y, pos.x - startPos.current.x, pos.y - startPos.current.y);
            } else if (tool === "circle") {
                const r = Math.hypot(pos.x - startPos.current.x, pos.y - startPos.current.y);
                ctx.arc(startPos.current.x, startPos.current.y, r, 0, Math.PI * 2);
                ctx.stroke();
            } else if (tool === "arrow") {
                const headlen = 20; // length of head in pixels
                const angle = Math.atan2(pos.y - startPos.current.y, pos.x - startPos.current.x);
                ctx.moveTo(startPos.current.x, startPos.current.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.lineTo(pos.x - headlen * Math.cos(angle - Math.PI / 6), pos.y - headlen * Math.sin(angle - Math.PI / 6));
                ctx.moveTo(pos.x, pos.y);
                ctx.lineTo(pos.x - headlen * Math.cos(angle + Math.PI / 6), pos.y - headlen * Math.sin(angle + Math.PI / 6));
                ctx.stroke();
            } else if (tool === "triangle") {
                const dx = pos.x - startPos.current.x;
                const dy = pos.y - startPos.current.y;
                ctx.moveTo(startPos.current.x, startPos.current.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.lineTo(startPos.current.x - (pos.x - startPos.current.x), pos.y);
                ctx.closePath();
                ctx.stroke();
            }
        }
        lastPos.current = pos;
    };

    const onPointerUp = () => { isDrawing.current = false; };

    const addShape = (shape: "rect" | "circle" | "triangle") => {
        const ctx = getCtx();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        saveHistory();
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const s = 200; // default size

        ctx.beginPath();
        if (shape === "rect") {
            ctx.strokeRect(centerX - s / 2, centerY - s / 2, s, s);
        } else if (shape === "circle") {
            ctx.arc(centerX, centerY, s / 2, 0, Math.PI * 2);
            ctx.stroke();
        } else if (shape === "triangle") {
            ctx.moveTo(centerX, centerY - s / 2);
            ctx.lineTo(centerX - s / 2, centerY + s / 2);
            ctx.lineTo(centerX + s / 2, centerY + s / 2);
            ctx.closePath();
            ctx.stroke();
        }
        toast.success(`Added ${shape}`);
    };

    const handleSave = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !onSave) return;
        setSaving(true);
        toast.loading("Preparing notes...", { id: "save-notes" });
        try {
            // First convert to blob and upload via the actual storage service
            const dataUrl = canvas.toDataURL("image/png");
            await onSave(dataUrl);
            toast.success("Notes saved to course history!", { id: "save-notes" });
        } catch (error) {
            console.error("Save Notes Error:", error);
            toast.error("Failed to save notes. The image might be too large.", { id: "save-notes" });
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        toast.loading("Generating PDF...", { id: "download-pdf" });
        try {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`class-notes-${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success("PDF downloaded!", { id: "download-pdf" });
        } catch (error) {
            console.error("PDF Download Error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    const TOOLS: { id: Tool; icon: React.ReactNode; title: string }[] = [
        { id: "pen", icon: <Pencil className="h-4 w-4" />, title: "Pen" },
        { id: "eraser", icon: <Eraser className="h-4 w-4" />, title: "Eraser" },
        { id: "line", icon: <Minus className="h-4 w-4" />, title: "Line" },
        { id: "arrow", icon: <ArrowUpRight className="h-4 w-4" />, title: "Arrow" },
        { id: "rect", icon: <Square className="h-4 w-4" />, title: "Rectangle" },
        { id: "circle", icon: <Circle className="h-4 w-4" />, title: "Circle" },
        { id: "triangle", icon: <Triangle className="h-4 w-4" />, title: "Triangle" },
        { id: "text", icon: <Type className="h-4 w-4" />, title: "Text" },
    ];

    return (
        <div className={cn("flex flex-col h-full rounded-lg overflow-hidden border border-zinc-700", !className?.includes('bg-') && "bg-[#1e1e2e]", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-700 shrink-0">
                {/* Tools */}
                <div className="flex items-center gap-1 border-r border-zinc-700 pr-2 mr-1">
                    {TOOLS.map(t => (
                        <button
                            key={t.id}
                            title={t.title}
                            onClick={() => setTool(t.id)}
                            className={cn(
                                "p-2 rounded transition-colors",
                                tool === t.id ? "bg-primary text-primary-foreground" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>

                {/* Colors */}
                <div className="flex items-center gap-1 border-r border-zinc-700 pr-2 mr-1">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            title={c}
                            onClick={() => setColor(c)}
                            className={cn(
                                "w-5 h-5 rounded-full border-2 transition-transform",
                                color === c ? "border-white scale-125" : "border-zinc-600"
                            )}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                {/* Sizes */}
                <div className="flex items-center gap-1 border-r border-zinc-700 pr-2 mr-1">
                    {SIZES.map(s => (
                        <button
                            key={s}
                            onClick={() => setSize(s)}
                            className={cn(
                                "w-6 h-6 flex items-center justify-center rounded",
                                size === s ? "bg-primary" : "hover:bg-zinc-800"
                            )}
                        >
                            <div
                                className="rounded-full bg-white"
                                style={{ width: Math.min(s, 18), height: Math.min(s, 18) }}
                            />
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <button title="Undo" onClick={undo} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded">
                    <Undo2 className="h-4 w-4" />
                </button>
                <button title="Redo" onClick={redo} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded">
                    <Redo2 className="h-4 w-4" />
                </button>
                <button title="Clear" onClick={clearCanvas} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded border-r border-zinc-700 pr-2 mr-1">
                    <Trash2 className="h-4 w-4" />
                </button>

                {/* Quick Add */}
                <div className="flex items-center gap-1 border-r border-zinc-700 pr-2 mr-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">Quick Add:</span>
                    <button onClick={() => addShape("rect")} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded" title="Add Square">
                        <Square className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => addShape("circle")} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded" title="Add Circle">
                        <Circle className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => addShape("triangle")} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded" title="Add Triangle">
                        <Triangle className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5 text-xs border-zinc-600 text-zinc-300 hover:text-white">
                        <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                    {onSave && (
                        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 text-xs">
                            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Notes"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Canvas Container with Scroll */}
            <div className="flex-1 overflow-auto bg-zinc-900/50">
                <canvas
                    ref={canvasRef}
                    width={1920}
                    height={3000} // Increased height for scrollability
                    className="w-full cursor-crosshair touch-none block mx-auto origin-top"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                />
            </div>
        </div>
    );
}
