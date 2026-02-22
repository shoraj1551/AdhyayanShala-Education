
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Slot {
    id?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => ({
    label: `${i.toString().padStart(2, '0')}:00`,
    value: `${i.toString().padStart(2, '0')}:00`
}));

export function AvailabilitySettings() {
    const { token } = useAuth();
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSlots();
    }, [token]);

    const fetchSlots = async () => {
        if (!token) return;
        try {
            const data = await api.get("/mentorship/slots", token);
            setSlots(data);
        } catch (error) {
            console.error("Failed to fetch slots", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addSlot = () => {
        setSlots([...slots, { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }]);
    };

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, field: keyof Slot, value: any) => {
        const newSlots = [...slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setSlots(newSlots);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post("/mentorship/slots", { slots }, token!);
            toast.success("Availability updated successfully!");
        } catch (error) {
            toast.error("Failed to save availability");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <Card className="border-2 border-white/50 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-8 border-b border-zinc-100/50 bg-white/20">
                <CardTitle className="text-2xl font-black tracking-tight">Mentorship <span className="text-primary">Availability</span></CardTitle>
                <CardDescription className="text-base text-zinc-500 font-medium">
                    Set your weekly recurring slots for 1-1 mentorship sessions.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
                <div className="space-y-6">
                    {slots.length === 0 ? (
                        <div className="text-center py-12 bg-white/20 rounded-2xl border-2 border-dashed border-zinc-200">
                            <Clock className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                            <p className="text-zinc-500 font-medium">No availability slots set yet.</p>
                            <Button variant="outline" onClick={addSlot} className="mt-4 gap-2">
                                <Plus className="h-4 w-4" /> Add Your First Slot
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {slots.map((slot, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white/60 rounded-2xl border border-white shadow-sm animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="flex-1 w-full sm:w-auto">
                                        <Select
                                            value={slot.dayOfWeek.toString()}
                                            onValueChange={(v) => updateSlot(index, "dayOfWeek", parseInt(v))}
                                        >
                                            <SelectTrigger className="bg-white border-zinc-200 rounded-xl h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DAYS.map((day, i) => (
                                                    <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Select
                                            value={slot.startTime}
                                            onValueChange={(v) => updateSlot(index, "startTime", v)}
                                        >
                                            <SelectTrigger className="bg-white border-zinc-200 rounded-xl h-11 w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {HOURS.map((h) => (
                                                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <span className="text-zinc-400">to</span>
                                        <Select
                                            value={slot.endTime}
                                            onValueChange={(v) => updateSlot(index, "endTime", v)}
                                        >
                                            <SelectTrigger className="bg-white border-zinc-200 rounded-xl h-11 w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {HOURS.map((h) => (
                                                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSlot(index)}
                                        className="text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addSlot} className="w-full h-14 border-dashed border-2 text-zinc-500 hover:text-primary hover:border-primary/50 transition-all rounded-2xl gap-2 font-bold uppercase tracking-widest text-xs">
                                <Plus className="h-4 w-4" /> Add Another Slot
                            </Button>
                        </div>
                    )}

                    <div className="pt-8 border-t border-zinc-100/50 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full md:w-auto min-w-[200px] h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]"
                        >
                            {isSaving && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                            {isSaving ? "SAVING..." : "SAVE AVAILABILITY"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
