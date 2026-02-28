
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    ChevronLeft,
    MessageSquare,
    Lightbulb,
    Volume2,
    Send,
    User,
    CheckCircle2,
    XCircle,
    RotateCcw
} from 'lucide-react';
import { MathRenderer } from "@/components/MathRenderer";
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function ProblemWorkspacePage() {
    const { id } = useParams();
    const router = useRouter();
    const { token, user } = useAuth();

    const [question, setQuestion] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isChecked, setIsChecked] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/practice/questions/${id}`);
                const data = await response.json();
                setQuestion(data);
            } catch (error) {
                console.error("Error fetching question:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [id]);

    const handleCheckAnswer = () => {
        if (!selectedOption) return;
        setIsChecked(true);
    };

    const handleReset = () => {
        setSelectedOption(null);
        setIsChecked(false);
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !token) return;
        setSubmittingComment(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/practice/questions/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: commentText })
            });
            const newComment = await response.json();
            setQuestion((prev: any) => ({
                ...prev,
                comments: [newComment, ...(prev.comments || [])]
            }));
            setCommentText("");
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!question) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold">Question not found</h2>
            <Button onClick={() => router.push('/practice')} className="mt-4">Back to Portal</Button>
        </div>
    );

    const isCorrect = isChecked && qisCorrect(question, selectedOption);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-zinc-50">
            {/* Top Toolbar */}
            <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/practice')} className="text-zinc-500 hover:text-indigo-600">
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Back
                    </Button>
                    <div className="h-6 w-px bg-zinc-200" />
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 uppercase text-[10px] font-bold tracking-widest">
                        {question.category || 'PRACTICE'}
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleReset} disabled={!selectedOption}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Split Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Question */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-zinc-900 leading-relaxed">
                                <MathRenderer text={question.text} />
                            </h2>
                            {question.imageUrl && (
                                <img src={question.imageUrl} alt="Question" className="rounded-xl border shadow-sm max-h-[400px] w-auto mx-auto bg-white" />
                            )}
                        </div>

                        <div className="space-y-4 pt-6">
                            {question.options.map((opt: any) => {
                                const isOptionCorrect = opt.isCorrect;
                                const isUserSelected = selectedOption === opt.id;

                                return (
                                    <div
                                        key={opt.id}
                                        className={cn(
                                            "relative flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer",
                                            isChecked
                                                ? isOptionCorrect
                                                    ? "border-green-500 bg-green-50 shadow-sm"
                                                    : isUserSelected ? "border-red-500 bg-red-50" : "border-zinc-100 opacity-60"
                                                : isUserSelected
                                                    ? "border-indigo-600 bg-indigo-50 shadow-sm"
                                                    : "border-zinc-200 bg-white hover:border-indigo-200 hover:shadow-md"
                                        )}
                                        onClick={() => !isChecked && setSelectedOption(opt.id)}
                                    >
                                        <div className={cn(
                                            "h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors",
                                            isChecked
                                                ? isOptionCorrect
                                                    ? "border-green-600 bg-green-600"
                                                    : isUserSelected ? "border-red-600 bg-red-600" : "border-zinc-200"
                                                : isUserSelected ? "border-indigo-600 bg-indigo-600" : "border-zinc-300"
                                        )}>
                                            {isUserSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                            {isChecked && isOptionCorrect && <CheckCircle2 className="h-4 w-4 text-white" />}
                                            {isChecked && isUserSelected && !isOptionCorrect && <XCircle className="h-4 w-4 text-white" />}
                                        </div>
                                        <div className="text-lg font-medium text-zinc-800">
                                            <MathRenderer text={opt.text} />
                                            {opt.imageUrl && (
                                                <img src={opt.imageUrl} alt="Option" className="mt-2 rounded-lg border max-h-32 w-auto bg-white" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {!isChecked ? (
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                                disabled={!selectedOption}
                                onClick={handleCheckAnswer}
                            >
                                Check Answer
                            </Button>
                        ) : (
                            <div className={cn(
                                "p-6 rounded-2xl border-2 flex flex-col gap-3",
                                isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                            )}>
                                <div className="flex items-center gap-3">
                                    {isCorrect ? (
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    ) : (
                                        <XCircle className="h-8 w-8 text-red-600" />
                                    )}
                                    <h3 className={cn("text-xl font-bold", isCorrect ? "text-green-800" : "text-red-800")}>
                                        {isCorrect ? 'Outstanding! Well done.' : 'Oops! That’s not quite right.'}
                                    </h3>
                                </div>
                                <p className={cn("text-sm", isCorrect ? "text-green-700" : "text-red-700")}>
                                    {isCorrect
                                        ? 'Take a moment to review the explanation on the right to solidify your understanding.'
                                        : 'Don\'t worry! Practice makes perfect. Check out the detailed solution on the right panel.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Solutions & Discussion */}
                <div className="w-[450px] bg-white border-l flex flex-col hidden lg:flex shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
                    <Tabs defaultValue="solution" className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="w-full justify-start rounded-none border-b bg-zinc-50 h-14 px-4 gap-2">
                            <TabsTrigger
                                value="solution"
                                className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-indigo-600 rounded-none h-14"
                            >
                                <Lightbulb className="h-4 w-4 mr-2" />
                                Solution
                            </TabsTrigger>
                            <TabsTrigger
                                value="discussion"
                                className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-indigo-600 rounded-none h-14"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Discussion
                                {question.comments?.length > 0 && (
                                    <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">
                                        {question.comments.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="solution" className="m-0 flex-1 overflow-hidden">
                            <ScrollArea className="h-full p-6">
                                <div className="space-y-8">
                                    {question.solution?.audioUrl && (
                                        <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                                    <Volume2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-indigo-900 leading-tight">Audio Explanation</h4>
                                                    <p className="text-xs text-indigo-600 font-medium">Listen to the instructor's logic</p>
                                                </div>
                                            </div>
                                            <audio controls className="w-full">
                                                <source src={question.solution.audioUrl} type="audio/mpeg" />
                                            </audio>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-zinc-900 border-b pb-3">Detailed Explanation</h3>
                                        <div className="prose prose-indigo max-w-none text-zinc-700 leading-relaxed">
                                            {question.solution?.text || question.explanation || "No detailed explanation available for this question yet."}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="discussion" className="m-0 flex-1 flex flex-col overflow-hidden">
                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    {!user ? (
                                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
                                            <p className="text-sm text-amber-800 font-medium mb-3">Login to participate in the discussion</p>
                                            <Button size="sm" onClick={() => router.push('/auth/login')} className="bg-amber-600 hover:bg-amber-700">Login Now</Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Textarea
                                                placeholder="Ask a question or share a tip..."
                                                className="min-h-[100px] border-zinc-200 focus:ring-indigo-500 rounded-xl"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                            />
                                            <div className="flex justify-end">
                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6" onClick={handleSubmitComment} disabled={submittingComment}>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    {submittingComment ? 'Posting...' : 'Post Comment'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-5 pt-4">
                                        {(question.comments || []).map((comment: any) => (
                                            <div key={comment.id} className="flex gap-4 group">
                                                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200 overflow-hidden">
                                                    {comment.user.imageUrl ? (
                                                        <img src={comment.user.imageUrl} alt={comment.user.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-zinc-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="text-sm font-bold text-zinc-900">{comment.user.name}</h5>
                                                        <span className="text-[10px] text-zinc-400 font-medium">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100 group-hover:bg-indigo-50/30 group-hover:border-indigo-100 transition-colors">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function qisCorrect(question: any, selectedId: string | null) {
    if (!selectedId) return false;
    const opt = question.options.find((o: any) => o.id === selectedId);
    return opt?.isCorrect || false;
}
