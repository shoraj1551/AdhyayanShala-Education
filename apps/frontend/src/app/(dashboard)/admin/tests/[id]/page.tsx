"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathRenderer } from "@/components/MathRenderer";

export default function TestEditorPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const [test, setTest] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        text: "",
        explanation: "",
        imageUrl: "", // Added
        points: 5,
        type: "MCQ",
        options: [
            { text: "", imageUrl: "", isCorrect: false }, // Added option image
            { text: "", imageUrl: "", isCorrect: false },
        ]
    });

    const refreshSort = (qs: any[]) => qs.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1)); // Simple sort

    useEffect(() => {
        if (token && id) {
            fetchTest();
        }
    }, [token, id]);

    const fetchTest = () => {
        const testId = Array.isArray(id) ? id[0] : id;
        if (!testId) return;

        api.get(`/tests/${testId}`, token || undefined)
            .then(data => {
                setTest(data);
                setQuestions(data.questions || []);
            })
            .finally(() => setLoading(false));
    };

    const handleAddQuestion = async () => {
        const testId = Array.isArray(id) ? id[0] : id;
        try {
            await api.post(`/tests/${testId}/questions`, newQuestion, token!);
            // Refresh
            fetchTest();
            setIsAdding(false);
            setNewQuestion({
                text: "", explanation: "", imageUrl: "", points: 5, type: "MCQ",
                options: [{ text: "", imageUrl: "", isCorrect: false }, { text: "", imageUrl: "", isCorrect: false }]
            });
        } catch (error) {
            alert("Failed to add question");
        }
    };

    const handleDeleteQuestion = async (qId: string) => {
        if (!confirm("Delete this question?")) return;
        try {
            await api.delete(`/tests/questions/${qId}`, token!);
            fetchTest();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const updateNewOption = (idx: number, field: string, value: any) => {
        const newOpts = [...newQuestion.options];
        newOpts[idx] = { ...newOpts[idx], [field]: value };
        // If setting Correct, unset others for MCQ (optional logic, but good UX)
        if (field === 'isCorrect' && value === true) {
            newOpts.forEach((o, i) => { if (i !== idx) o.isCorrect = false; });
        }
        setNewQuestion({ ...newQuestion, options: newOpts });
    };

    const addOptionRow = () => {
        setNewQuestion({ ...newQuestion, options: [...newQuestion.options, { text: "", imageUrl: "", isCorrect: false }] })
    }

    if (loading) return <div className="p-8">Loading Editor...</div>;
    if (!test) return <div className="p-8">Test not found</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Editing: {test.title}</h1>
                    <p className="text-muted-foreground">Manage questions and content</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : "Add Question"}
                </Button>
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                {/* Questions List */}
                <div className="lg:col-span-2 space-y-6">
                    {isAdding && (
                        <Card className="border-2 border-primary">
                            <CardHeader>
                                <CardTitle>New Question</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Question Text (supports math like $x^2$)</Label>
                                    <Textarea value={newQuestion.text} onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })} placeholder="e.g. Solve $x^2 + 2x + 1 = 0$" />
                                    <Input
                                        className="mt-2"
                                        value={newQuestion.imageUrl}
                                        onChange={e => setNewQuestion({ ...newQuestion, imageUrl: e.target.value })}
                                        placeholder="Question Image URL (optional)"
                                    />
                                    {newQuestion.imageUrl && <img src={newQuestion.imageUrl} alt="Preview" className="mt-2 max-h-40 rounded border" />}
                                </div>

                                <div className="space-y-2">
                                    <Label>Options</Label>
                                    {newQuestion.options.map((opt: any, idx) => (
                                        <div key={idx} className="flex flex-col gap-2 p-3 border rounded bg-muted/20">
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="radio"
                                                    name="correctOrigin"
                                                    checked={opt.isCorrect}
                                                    onChange={(e) => updateNewOption(idx, 'isCorrect', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <Input
                                                    value={opt.text}
                                                    onChange={e => updateNewOption(idx, 'text', e.target.value)}
                                                    placeholder={`Option ${idx + 1}`}
                                                />
                                            </div>
                                            <Input
                                                className="text-xs h-8"
                                                value={opt.imageUrl || ""}
                                                onChange={e => updateNewOption(idx, 'imageUrl', e.target.value)}
                                                placeholder={`Option ${idx + 1} Image URL`}
                                            />
                                            {opt.imageUrl && <img src={opt.imageUrl} alt="Opt Preview" className="h-16 w-auto object-contain rounded border" />}
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" size="sm" onClick={addOptionRow}>+ Add Option</Button>
                                </div>

                                <div>
                                    <Label>Explanation (Optional)</Label>
                                    <Input value={newQuestion.explanation} onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })} placeholder="Why is this correct?" />
                                </div>

                                <Button className="w-full" onClick={handleAddQuestion}>Save Question</Button>
                            </CardContent>
                        </Card>
                    )}

                    {questions.map((q, i) => (
                        <Card key={q.id}>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <CardTitle className="text-lg">
                                    {i + 1}. <MathRenderer text={q.text} />
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-1">
                                    {q.options.map((o: any) => (
                                        <li key={o.id} className={cn(o.isCorrect ? "text-green-600 font-medium" : "text-muted-foreground")}>
                                            {o.text} {o.isCorrect && "(Correct)"}
                                        </li>
                                    ))}
                                </ul>
                                {q.explanation && (
                                    <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                                        💡 {q.explanation}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {questions.length === 0 && !isAdding && (
                        <div className="text-center p-12 text-muted-foreground bg-muted/10 rounded-lg border-dashed border-2">
                            No questions yet. Click "Add Question" to start.
                        </div>
                    )}
                </div>

                {/* Sidebar / Meta */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">
                                <p><strong>Total Questions:</strong> {questions.length}</p>
                                <p><strong>Total Points:</strong> {questions.reduce((a, b) => a + b.points, 0)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
