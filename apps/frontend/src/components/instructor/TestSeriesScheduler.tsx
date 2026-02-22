"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Wand2, Save, Trash2, CalendarCheck } from "lucide-react";
import { format, addDays } from "date-fns";

interface Test {
    id: string;
    title: string;
    availableAt?: string | null;
    order: number;
}

interface TestSeriesSchedulerProps {
    tests: Test[];
    onSave: (scheduledTests: { id: string; availableAt: string }[]) => Promise<void>;
    startDate?: string;
}

export function TestSeriesScheduler({ tests, onSave, startDate: courseStartDate }: TestSeriesSchedulerProps) {
    const [scheduledTests, setScheduledTests] = useState<Test[]>(tests);
    const [gapDays, setGapDays] = useState(2);
    const [baseDate, setBaseDate] = useState(courseStartDate || format(new Date(), "yyyy-MM-dd"));
    const [loading, setLoading] = useState(false);

    const handleDateChange = (id: string, date: string) => {
        setScheduledTests(prev => prev.map(t =>
            t.id === id ? { ...t, availableAt: date } : t
        ));
    };

    const autoSchedule = () => {
        let currentDate = new Date(baseDate);
        const newSchedule = [...scheduledTests].sort((a, b) => a.order - b.order).map((test, index) => {
            const scheduledAt = format(currentDate, "yyyy-MM-dd'T'10:00:00"); // Default to 10 AM
            currentDate = addDays(currentDate, gapDays);
            return { ...test, availableAt: scheduledAt };
        });
        setScheduledTests(newSchedule);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = scheduledTests
                .filter(t => t.availableAt)
                .map(t => ({ id: t.id, availableAt: t.availableAt as string }));
            await onSave(updates);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2 text-purple-900">
                        <CalendarCheck className="h-5 w-5" />
                        Test Series Scheduling
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={autoSchedule} className="bg-white hover:bg-purple-100 border-purple-200 text-purple-700">
                            <Wand2 className="h-4 w-4 mr-2" />
                            Auto-Schedule
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? "Saving..." : "Save Schedule"}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Auto Schedule Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                    <div className="space-y-2">
                        <Label className="text-purple-900 font-medium">Start Date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                            <Input
                                type="date"
                                className="pl-9 border-purple-100 focus:ring-purple-200"
                                value={baseDate.split('T')[0]}
                                onChange={(e) => setBaseDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-purple-900 font-medium">Gap (Days between tests)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                min="0"
                                className="border-purple-100 focus:ring-purple-200"
                                value={gapDays}
                                onChange={(e) => setGapDays(Number(e.target.value))}
                            />
                            <span className="text-sm text-purple-600 whitespace-nowrap">days</span>
                        </div>
                    </div>
                </div>

                {/* Test List */}
                <div className="space-y-3">
                    {scheduledTests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground italic bg-white/50 rounded-lg border border-dashed border-purple-200">
                            No tests available to schedule. Add tests to the curriculum first.
                        </div>
                    ) : (
                        scheduledTests.map((test, index) => (
                            <div key={test.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white rounded-lg border border-purple-100 shadow-sm hover:border-purple-300 transition-colors gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-purple-900">{test.title}</p>
                                        <p className="text-xs text-purple-500">Scheduled for release</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                                        <Input
                                            type="datetime-local"
                                            className="pl-9 border-purple-100 focus:ring-purple-200 h-9 text-sm"
                                            value={test.availableAt ? format(new Date(test.availableAt), "yyyy-MM-dd'T'HH:mm") : ""}
                                            onChange={(e) => handleDateChange(test.id, e.target.value)}
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDateChange(test.id, "")}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
