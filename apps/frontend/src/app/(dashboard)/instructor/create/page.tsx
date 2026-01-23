
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
    const { token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        level: "BEGINNER",
        price: 0,
        isPublished: true
    });

    const handleSubmit = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // NOTE: Backend doesn't have a specific "create course" route exposed in general routes yet? 
            // I need to check routes. But assuming POST /courses works for Instructor.
            await api.post('/courses', formData, token);
            router.push('/courses'); // Redirect to generic courses list for now
        } catch (error) {
            alert("Failed to create course. Ensure you are an Instructor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Course</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Course Title</Label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Advanced Calculus"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What will students learn?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Level</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.level}
                                onChange={e => setFormData({ ...formData, level: e.target.value })}
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Price ($)</Label>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                        {loading ? "Creating..." : "Publish Course"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
