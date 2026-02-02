"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Image as ImageIcon, Loader2, Plus, Trash, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// LateX hint component
const LatexHint = () => (
    <div className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
        <span className="font-semibold">Math Support:</span> Use <code className="bg-background px-1 rounded">$$x^2$$</code> for inline math or block math.
        Example: <code className="bg-background px-1 rounded">$$\frac{`{a}`}{`{b}`}$$</code>
    </div>
);

export default function TestEditorPage() {
    const { token } = useAuth();
    const params = useParams(); // id is the testId
    const router = useRouter();
    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Question Form State
    const [questions, setQuestions] = useState<any[]>([]);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null); // null = creating new

    const [formData, setFormData] = useState({
        text: "",
        imageUrl: "",
        points: 1,
        explanation: "",
        options: [
            { text: "", imageUrl: "", isCorrect: true },
            { text: "", imageUrl: "", isCorrect: false },
            { text: "", imageUrl: "", isCorrect: false },
            { text: "", imageUrl: "", isCorrect: false }
        ]
    });

    const fetchTest = () => {
        if (token && params.id) {
            setLoading(true);
            api.get(`/tests/${params.id}`, token)
                .then(data => {
                    setTest(data);
                    setQuestions(data.questions || []);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    };

    useEffect(() => {
        fetchTest();
    }, [token, params.id]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'question' | number) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setUploading(true);
        try {
            const result = await api.upload(file, token);
            if (target === 'question') {
                setFormData(prev => ({ ...prev, imageUrl: result.url }));
            } else {
                // Target is option index
                setFormData(prev => {
                    const newOptions = [...prev.options];
                    newOptions[target] = { ...newOptions[target], imageUrl: result.url };
                    return { ...prev, options: newOptions };
                });
            }
        } catch (error) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveQuestion = async () => {
        if (!formData.text && !formData.imageUrl) {
            alert("Question must have text or image");
            return;
        }

        try {
            if (editingQuestionId) {
                // Update
                // Need to implement PUT on backend side properly or just delete/create for simplicity if update is complex? 
                // Backend route exists: PUT /questions/:id
                await api.put(`/tests/questions/${editingQuestionId}`, formData, token ?? undefined);
            } else {
                // Create
                await api.post(`/tests/${params.id}/questions`, formData, token ?? undefined);
            }

            // Reset and refresh
            setEditingQuestionId(null);
            setFormData({
                content: "",
                imageUrl: "",
                points: 1,
                explanation: "",
                options: [
                    { text: "", imageUrl: "", isCorrect: true },
                    { text: "", imageUrl: "", isCorrect: false },
                    { text: "", imageUrl: "", isCorrect: false },
                    { text: "", imageUrl: "", isCorrect: false }
                ]
            });
            fetchTest();
        } catch (error) {
            console.error(error);
            alert("Failed to save question");
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("Delete this question?")) return;
        try {
            await api.delete(`/tests/questions/${id}`, token ?? undefined);
            fetchTest();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    const handleEditClick = (q: any) => {
        setEditingQuestionId(q.id);
        setFormData({
            text: q.text || q.content,
            imageUrl: q.imageUrl,
            points: q.points,
            explanation: q.explanation || "",
            options: q.options ? q.options.map((o: any) => ({
                text: o.text || o.content,
                imageUrl: o.imageUrl,
                isCorrect: o.isCorrect
            })) : []
        });
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /> Loading Test...</div>;

    return (
        <div className="container mx-auto p-6 max-w-6xl h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{test?.title || "Test Editor"}</h1>
                    <p className="text-sm text-muted-foreground">{questions.length} Questions • {test?.duration} Mins</p>
                </div>
            </div>

            <div className="flex gap-6 flex-1 overflow-hidden">
                {/* Left: Question List */}
                <div className="w-1/3 overflow-y-auto pr-2 border-r">
                    <Button className="w-full mb-4" onClick={() => {
                        setEditingQuestionId(null);
                        setFormData({
                            content: "",
                            imageUrl: "",
                            points: 1,
                            explanation: "",
                            options: [
                                { text: "", imageUrl: "", isCorrect: true },
                                { text: "", imageUrl: "", isCorrect: false },
                                { text: "", imageUrl: "", isCorrect: false },
                                { text: "", imageUrl: "", isCorrect: false }
                            ]
                        });
                    }}>
                        <Plus className="h-4 w-4 mr-2" /> One New Question
                    </Button>

                    <div className="space-y-3">
                        {questions.map((q, idx) => (
                            <div
                                key={q.id}
                                className={cn("p-3 border rounded cursor-pointer hover:bg-muted relative group", editingQuestionId === q.id && "border-primary bg-primary/5")}
                                onClick={() => handleEditClick(q)}
                            >
                                <div className="font-semibold text-sm mb-1">Q{idx + 1}</div>
                                <div className="text-xs text-muted-foreground line-clamp-2">{q.content || "(Image Question)"}</div>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                                >
                                    <Trash className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Editor */}
                <div className="flex-1 overflow-y-auto pl-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingQuestionId ? "Edit Question" : "New Question"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Question Content */}
                            <div className="space-y-2">
                                <Label>Question Text (LaTeX Supported)</Label>
                                <Textarea
                                    placeholder="Type your question here... use $$x^2$$ for math"
                                    value={formData.text}
                                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                                    className="min-h-[100px]"
                                />
                                <LatexHint />

                                <div className="flex items-center gap-2 mt-2">
                                    <Input
                                        id="q-image"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, 'question')}
                                    />
                                    <Button variant="outline" size="sm" onClick={() => document.getElementById('q-image')?.click()} disabled={uploading}>
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        {formData.imageUrl ? "Change Image" : "Upload Image"}
                                    </Button>
                                    {formData.imageUrl && <span className="text-xs text-green-600 flex items-center"><Check className="h-3 w-3 mr-1" /> Image Attached</span>}
                                </div>
                                {formData.imageUrl && (
                                    <img src={formData.imageUrl} alt="Question" className="h-32 object-contain mt-2 border rounded" />
                                )}
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                                <Label>Answer Options</Label>
                                {formData.options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-3 items-start p-3 border rounded bg-muted/10">
                                        <div className="pt-2">
                                            <input
                                                type="radio"
                                                name="correct-opt"
                                                checked={opt.isCorrect}
                                                onChange={() => {
                                                    const newOpts = formData.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                                                    setFormData({ ...formData, options: newOpts });
                                                }}
                                                className="h-4 w-4 text-primary"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder={`Option ${idx + 1}`}
                                                value={opt.text}
                                                onChange={e => {
                                                    const newOpts = [...formData.options];
                                                    newOpts[idx].text = e.target.value;
                                                    setFormData({ ...formData, options: newOpts });
                                                }}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id={`opt-img-${idx}`}
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, idx)}
                                                />
                                                <Button size="sm" variant="ghost" onClick={() => document.getElementById(`opt-img-${idx}`)?.click()} disabled={uploading} className="h-6 text-xs">
                                                    <ImageIcon className="h-3 w-3 mr-1" /> Image
                                                </Button>
                                                {opt.imageUrl && <span className="text-[10px] text-green-600">Attached</span>}
                                            </div>
                                            {opt.imageUrl && (
                                                <img src={opt.imageUrl} alt={`Option ${idx + 1}`} className="h-16 object-contain border rounded" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Explanation */}
                            <div className="space-y-2">
                                <Label>Explanation (Optional)</Label>
                                <Textarea
                                    placeholder="Explain the correct answer..."
                                    value={formData.explanation}
                                    onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                                />
                            </div>

                            <Button onClick={handleSaveQuestion} className="w-full" disabled={uploading}>
                                {uploading ? "Uploading..." : (editingQuestionId ? "Update Question" : "Add Question")}
                            </Button>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
