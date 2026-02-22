
"use client";

import { useRef, useState, useCallback } from "react";
import {
    Pencil, Eraser, Square, Type, Trash2, Download,
    Circle, Minus, Undo2, Redo2, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tool = "pen" | "eraser" | "line" | "rect" | "circle" | "text";

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

        if (tool === "pen" || tool === "eraser") {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        } else {
            snapshot.current = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        }

        ctx.strokeStyle = tool === "eraser" ? "#1e1e2e" : color;
        ctx.lineWidth = tool === "eraser" ? size * 4 : size;
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
            ctx.putImageData(snapshot.current, 0, 0);
            ctx.beginPath();
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
            }
        }
        lastPos.current = pos;
    };

    const onPointerUp = () => { isDrawing.current = false; };

    const handleSave = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !onSave) return;
        setSaving(true);
        try {
            const dataUrl = canvas.toDataURL("image/png");
            await onSave(dataUrl);
            toast.success("Notes saved!");
        } catch {
            toast.error("Failed to save notes");
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const a = document.createElement("a");
        a.download = `class-notes-${new Date().toISOString().slice(0, 10)}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
        toast.success("Notes downloaded!");
    };

    const TOOLS: { id: Tool; icon: React.ReactNode; title: string }[] = [
        { id: "pen", icon: <Pencil className="h-4 w-4" />, title: "Pen" },
        { id: "eraser", icon: <Eraser className="h-4 w-4" />, title: "Eraser" },
        { id: "line", icon: <Minus className="h-4 w-4" />, title: "Line" },
        { id: "rect", icon: <Square className="h-4 w-4" />, title: "Rectangle" },
        { id: "circle", icon: <Circle className="h-4 w-4" />, title: "Circle" },
        { id: "text", icon: <Type className="h-4 w-4" />, title: "Text" },
    ];

    return (
        <div className={cn("flex flex-col h-full bg-[#1e1e2e] rounded-lg overflow-hidden border border-zinc-700", className)}>
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
                <button title="Clear" onClick={clearCanvas} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded">
                    <Trash2 className="h-4 w-4" />
                </button>

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

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="flex-1 w-full cursor-crosshair touch-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
            />
        </div>
    );
}
