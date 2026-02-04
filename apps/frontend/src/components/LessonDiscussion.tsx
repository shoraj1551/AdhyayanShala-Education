import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Reply, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    avatar?: string;
    role: string;
}

interface Comment {
    id: string;
    content: string;
    user: User;
    createdAt: string;
    replies: Comment[];
}

export function LessonDiscussion({ lessonId }: { lessonId: string }) {
    const { user, token } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [askOpen, setAskOpen] = useState(false);
    const [questionText, setQuestionText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reply State
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    const fetchComments = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/lessons/${lessonId}/comments`, token);
            setComments(data);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lessonId && token) fetchComments();
    }, [lessonId, token]);

    const handleAskQuestion = async () => {
        if (!questionText.trim()) return;
        setIsSubmitting(true);
        try {
            await api.post(`/lessons/${lessonId}/comments`, { content: questionText }, token);
            toast.success("Question posted successfully");
            setQuestionText("");
            setAskOpen(false);
            fetchComments();
        } catch (error) {
            toast.error("Failed to post question");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async (commentId: string) => {
        if (!replyText.trim()) return;
        try {
            await api.post(`/comments/${commentId}/reply`, { content: replyText, lessonId }, token);
            toast.success("Reply posted");
            setReplyText("");
            setReplyingTo(null);
            fetchComments();
        } catch (error) {
            toast.error("Failed to post reply");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading specific discussions...</div>;

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {/* Header / Ask Button */}
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Q&A
                    </h3>
                    <p className="text-sm text-muted-foreground">Ask questions and discuss with instructors and peers.</p>
                </div>
                <Dialog open={askOpen} onOpenChange={setAskOpen}>
                    <DialogTrigger asChild>
                        <Button>Ask a Question</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ask a Question</DialogTitle>
                            <DialogDescription>
                                Post your question here. It will be visible to everyone in this course.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                placeholder="What's your question?"
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAskOpen(false)}>Cancel</Button>
                            <Button onClick={handleAskQuestion} disabled={isSubmitting || !questionText.trim()}>
                                {isSubmitting ? "Posting..." : "Post Question"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            {comments.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20 border-dashed">
                    <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <h3 className="font-semibold text-muted-foreground">No questions yet</h3>
                    <p className="text-sm text-muted-foreground">Be the first to start the discussion!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-5 bg-card shadow-sm hover:border-primary/20 transition-colors">
                            {/* Comment Head */}
                            <div className="flex gap-4">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage src={comment.user.avatar} />
                                    <AvatarFallback><UserIcon className="h-5 w-5 opacity-50" /></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{comment.user.name || "User"}</span>
                                            {comment.user.role === 'INSTRUCTOR' && <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded">INSTRUCTOR</span>}
                                            <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-foreground/90 whitespace-pre-line">{comment.content}</p>

                                    <div className="pt-2">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                                            <Reply className="h-3 w-3 mr-1.5" /> Reply
                                        </Button>
                                    </div>

                                    {/* Reply Input */}
                                    {replyingTo === comment.id && (
                                        <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1">
                                            <Textarea
                                                placeholder="Write a reply..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="min-h-[60px] text-sm"
                                            />
                                            <Button size="sm" className="self-end" onClick={() => handleReply(comment.id)}>Post</Button>
                                        </div>
                                    )}

                                    {/* Replies List */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-4 pl-4 border-l-2 space-y-4">
                                            {comment.replies.map(reply => (
                                                <div key={reply.id} className="flex gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={reply.user.avatar} />
                                                        <AvatarFallback className="text-xs">U</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm">{reply.user.name}</span>
                                                            {reply.user.role === 'INSTRUCTOR' && <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded">INSTRUCTOR</span>}
                                                            <span className="text-[10px] text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-foreground/80 mt-1">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
