
"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import debounce from "lodash.debounce"; // If available, else simple timeout

export function NotesTab({ lessonId }: { lessonId: string }) {
    const { token } = useAuth();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        if (!lessonId || !token) return;
        setLoading(true);
        api.get(`/courses/lessons/${lessonId}/note`, token)
            .then(data => {
                setContent(data.content || "");
                if (data.updatedAt) setLastSaved(new Date(data.updatedAt));
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [lessonId, token]);

    const saveNote = async (newContent: string) => {
        if (!token) return;
        setSaving(true);
        try {
            const res = await api.post(`/courses/lessons/${lessonId}/note`, { content: newContent }, token);
            setLastSaved(new Date());
        } catch (err) {
            console.error("Failed to save note", err);
            toast.error("Failed to save note");
        } finally {
            setSaving(false);
        }
    };

    // Auto-save logic
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(
        debounce((val: string) => saveNote(val), 2000),
        [lessonId, token]
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setContent(val);
        debouncedSave(val);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold">My Notes</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {saving ? (
                        <span className="flex items-center text-primary"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Saving...</span>
                    ) : lastSaved ? (
                        <span>Saved {lastSaved.toLocaleTimeString()}</span>
                    ) : null}
                    <Button size="sm" onClick={() => saveNote(content)} disabled={saving}>
                        <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                </div>
            </div>
            <Textarea
                value={content}
                onChange={handleChange}
                placeholder="Type your notes here... (Auto-saved)"
                className="min-h-[300px] font-mono text-sm leading-relaxed p-4"
            />
        </div>
    );
}
