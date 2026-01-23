"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateTestPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        courseId: "",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token) {
            api.get('/courses', token).then(setCourses).catch(console.error);
        }
    }, [token]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const newTest = await api.post('/tests', formData, token!);
            router.push(`/admin/tests/${newTest.id}`);
        } catch (error) {
            alert('Failed to create test');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Test Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="course">Linked Course</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, courseId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create & Add Questions'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
