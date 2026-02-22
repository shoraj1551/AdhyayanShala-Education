import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ResourcesPanelProps {
    courseId: string;
    brochureUrl?: string;
    authToken: string;
}

export function ResourcesPanel({ courseId, brochureUrl, authToken }: ResourcesPanelProps) {
    const handleDownload = () => {
        if (!brochureUrl) return;
        const a = document.createElement("a");
        a.href = brochureUrl;
        a.download = "course-brochure" + (brochureUrl.endsWith('.pdf') ? '.pdf' : '.png');
        a.click();
    };

    const handleSaveNotes = async (url: string, title?: string) => {
        try {
            await api.post(`/courses/${courseId}/live/notes`, { url, title }, authToken);
            toast.success("Notes saved successfully");
        } catch {
            toast.error("Failed to save notes");
        }
    };

    return (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Resources
            </h3>
            {brochureUrl && (
                <div className="flex items-center justify-between mb-3">
                    <Badge variant="default" className="bg-blue-600 text-white">Course Brochure</Badge>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1">
                        <Download className="h-4 w-4" /> Download
                    </Button>
                </div>
            )}
            {/* Placeholder for notes - in real app this would list saved notes */}
            <Button variant="outline" size="sm" onClick={() => handleSaveNotes('https://example.com/notes.png', 'Demo Note')}
                className="mt-2">
                Save Current Whiteboard as Note
            </Button>
        </div>
    );
}
