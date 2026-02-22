"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Calculator, ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, Maximize, Save, AlertOctagon, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Option {
    id: string;
    text: string;
    imageUrl?: string;
}

interface Question {
    id: string;
    text: string;
    type: string;
    imageUrl?: string;
    options: Option[];
    points: number;
    negativeMarks?: number;
}

interface Test {
    id: string;
    title: string;
    duration: number; // minutes
    questions: Question[];
    instructions?: string;
}

// Keep track of internal question status
type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_review' | 'answered_marked_review';

export default function TestAttemptPage() {
    const { token, user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);

    // Attempt tracking
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>({});

    // Timers
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);

    // Track time spent per question
    const timeSpentPerQuestion = useRef<Record<string, number>>({});
    const lastQuestionSwitchTime = useRef<number>(Date.now());

    // Timer Interval
    useEffect(() => {
        if (!test || submitting || timeLeftSeconds <= 0) return;

        const tick = setInterval(() => {
            setTimeLeftSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(tick);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(tick);
    }, [test, submitting, timeLeftSeconds]);

    // Format time
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Load Initial Data
    useEffect(() => {
        if (!token || !params.id) return;

        async function loadTest() {
            setLoading(true);
            try {
                // Fetch the test
                const testData = await api.get(`/tests/${params.id}`, token);
                setTest(testData);

                // Start or Resume attempt
                // The backend API handles restoring progress if an attempt already exists
                const attemptData = await api.post(`/tests/${params.id}/attempt/start`, {}, token);

                setAttemptId(attemptData.id);
                setAnswers(attemptData.responses || {});

                // Init statuses
                const initialStatuses: Record<string, QuestionStatus> = {};
                testData.questions.forEach((q: Question, idx: number) => {
                    const answered = !!attemptData.responses?.[q.id];
                    initialStatuses[q.id] = answered ? 'answered' : (idx === 0 ? 'not_answered' : 'not_visited');
                });
                setQuestionStatuses(initialStatuses);

                // Manage time
                const secondsAllocated = testData.duration * 60;
                // We'll trust the user's local clock for display but rely on the server for actual enforcement in a prod app.
                setTimeLeftSeconds(secondsAllocated);

            } catch (err) {
                console.error("Failed test load", err);
                toast.error("Failed to load test. Make sure you are enrolled.");
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        }

        loadTest();
    }, [token, params.id, router]);

    // Handle Fullscreen request
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                toast.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Warn on refresh or tab close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "Are you sure you want to leave? Your progress will be saved but time may continue.";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    // Sync Attempt Progress to backend periodically
    const syncProgress = useCallback(async () => {
        if (!attemptId || !token) return;
        try {
            await api.put(`/tests/attempt/${attemptId}/sync`, {
                responses: answers,
                // you could also sync time spent here
            }, token);
            toast.success("Progress Saved", { id: "sync-toast", duration: 1500 });
        } catch (err) {
            console.error("Sync failed", err);
        }
    }, [attemptId, answers, token]);

    // Hook to sync every 2 minutes
    useEffect(() => {
        const syncInterval = setInterval(syncProgress, 2 * 60 * 1000);
        return () => clearInterval(syncInterval);
    }, [syncProgress]);


    // Action Handlers
    const trackTime = () => {
        if (!test) return;
        const currentQ = test.questions[currentQuestionIdx];
        const now = Date.now();
        const spent = Math.floor((now - lastQuestionSwitchTime.current) / 1000);
        timeSpentPerQuestion.current[currentQ.id] = (timeSpentPerQuestion.current[currentQ.id] || 0) + spent;
        lastQuestionSwitchTime.current = now;
    };

    const jumpToQuestion = (idx: number) => {
        if (!test) return;
        trackTime();

        // Mark current as not_answered if it was not_visited and hasn't been answered
        const prevQ = test.questions[currentQuestionIdx];
        setQuestionStatuses(prev => {
            const currentStatus = prev[prevQ.id];
            if (currentStatus === 'not_visited') {
                return { ...prev, [prevQ.id]: 'not_answered' };
            }
            return prev;
        });

        setCurrentQuestionIdx(idx);

        // Mark new as not_answered if it was not_visited
        const newQ = test.questions[idx];
        setQuestionStatuses(prev => {
            if (prev[newQ.id] === 'not_visited') {
                return { ...prev, [newQ.id]: 'not_answered' };
            }
            return prev;
        });
    };

    const handleOptionSelect = (optionId: string) => {
        if (!test) return;
        const qId = test.questions[currentQuestionIdx].id;

        setAnswers(prev => ({ ...prev, [qId]: optionId }));

        setQuestionStatuses(prev => {
            const current = prev[qId];
            if (current === 'marked_review') return { ...prev, [qId]: 'answered_marked_review' };
            return { ...prev, [qId]: 'answered' };
        });
    };

    const handleClearResponse = () => {
        if (!test) return;
        const qId = test.questions[currentQuestionIdx].id;

        setAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[qId];
            return newAnswers;
        });

        setQuestionStatuses(prev => {
            const current = prev[qId];
            if (current === 'answered_marked_review') return { ...prev, [qId]: 'marked_review' };
            return { ...prev, [qId]: 'not_answered' };
        });
    };

    const handleMarkReview = () => {
        if (!test) return;
        const qId = test.questions[currentQuestionIdx].id;

        setQuestionStatuses(prev => {
            const current = prev[qId];
            if (current === 'answered') return { ...prev, [qId]: 'answered_marked_review' };
            if (current === 'answered_marked_review') return { ...prev, [qId]: 'answered' };
            if (current === 'not_answered' || current === 'not_visited') return { ...prev, [qId]: 'marked_review' };
            if (current === 'marked_review') return { ...prev, [qId]: 'not_answered' };
            return prev;
        });
    };

    const handleSaveAndNext = () => {
        if (!test) return;
        syncProgress();
        if (currentQuestionIdx < test.questions.length - 1) {
            jumpToQuestion(currentQuestionIdx + 1);
        }
    };

    const handleAutoSubmit = async () => {
        toast.error("Time is up! Submitting your test automatically...");
        await finalSubmit();
    };

    const promptSubmit = () => {
        if (!test) return;
        const unansweredCount = test.questions.length - Object.keys(answers).length;
        if (unansweredCount > 0) {
            if (!confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to final submit?`)) {
                return;
            }
        } else {
            if (!confirm("Are you sure you want to submit your test?")) return;
        }
        finalSubmit();
    };

    const finalSubmit = async () => {
        if (!attemptId || !token) return;
        trackTime(); // capture last question time
        setSubmitting(true);

        try {
            await api.post(`/tests/attempt/${attemptId}/submit`, {
                responses: answers,
                timeSpent: timeSpentPerQuestion.current
            }, token);

            toast.success("Test submitted successfully!");
            router.push(`/dashboard/tests/results/${attemptId}`); // Make sure to build this page next
        } catch (err) {
            console.error("Submit failed", err);
            toast.error("Failed to submit test.");
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <h2 className="text-xl font-semibold">Preparing your test environment...</h2>
                    <p className="text-muted-foreground">Please wait while we load your questions securely.</p>
                </div>
            </div>
        );
    }

    if (!test) return <div className="p-8 text-center text-red-500 font-bold">Failed to load test parameters.</div>;

    const currentQ = test.questions[currentQuestionIdx];

    // Status counter helpers
    const answeredCount = Object.values(questionStatuses).filter(s => s === 'answered' || s === 'answered_marked_review').length;
    const notAnsweredCount = Object.values(questionStatuses).filter(s => s === 'not_answered').length;
    const markedCount = Object.values(questionStatuses).filter(s => s === 'marked_review').length;
    const answeredMarkedCount = Object.values(questionStatuses).filter(s => s === 'answered_marked_review').length;
    const notVisitedCount = Object.values(questionStatuses).filter(s => s === 'not_visited').length;

    // Badge styling helper
    const getBadgeStyle = (status: QuestionStatus, isCurrent: boolean) => {
        let base = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all cursor-pointer ";
        if (isCurrent) base += "ring-2 ring-primary ring-offset-2 ";

        switch (status) {
            case 'answered': return base + "bg-green-600 border-green-700 text-white";
            case 'not_answered': return base + "bg-red-500 border-red-600 text-white";
            case 'not_visited': return base + "bg-zinc-200 border-zinc-300 text-zinc-700";
            case 'marked_review': return base + "bg-purple-500 border-purple-600 text-white";
            case 'answered_marked_review': return base + "bg-purple-500 border-purple-600 text-white relative after:content-[''] after:absolute after:w-3 after:h-3 after:bg-green-400 after:rounded-full after:-bottom-1 after:-right-1 after:border-2 after:border-white";
            default: return base;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-100 overflow-hidden font-sans select-none">
            {/* Header */}
            <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg text-zinc-800 hidden sm:block">{test.title}</h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* Timer */}
                    <div className={cn("flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-lg font-mono text-xl tracking-wider font-bold", timeLeftSeconds < 300 && "bg-red-100 text-red-700 animate-pulse")}>
                        <Clock className="h-5 w-5" />
                        {formatTime(timeLeftSeconds)}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCalculator(!showCalculator)}>
                            <Calculator className="h-4 w-4 mr-2" />
                            <span className="hidden md:inline">Calculator</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={toggleFullScreen}>
                            <Maximize className="h-4 w-4 mr-2" />
                            <span className="hidden md:inline">{isFullScreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Left Side: Question Area */}
                <div className="flex flex-col flex-1 overflow-hidden bg-white">
                    {/* Question Header */}
                    <div className="p-4 border-b flex justify-between items-center bg-zinc-50 shrink-0">
                        <div className="flex gap-4">
                            <span className="font-bold text-lg">Question {currentQuestionIdx + 1}</span>
                            <div className="flex gap-2 text-sm text-muted-foreground items-center">
                                <span>Points: <strong className="text-green-600">+{currentQ.points}</strong></span>
                                {currentQ.negativeMarks && currentQ.negativeMarks > 0 && (
                                    <span>Penalty: <strong className="text-red-500">-{currentQ.negativeMarks}</strong></span>
                                )}
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                            Single Correct Option
                        </div>
                    </div>

                    {/* Question Content */}
                    <ScrollArea className="flex-1 p-6 lg:p-10">
                        <div className="max-w-4xl space-y-8 pb-32">
                            {/* The Question Text View */}
                            <div className="text-lg lg:text-xl font-medium text-zinc-800 leading-relaxed whitespace-pre-wrap">
                                {currentQ.text}
                            </div>

                            {/* Question Image */}
                            {currentQ.imageUrl && (
                                <img src={currentQ.imageUrl} alt="Question figure" className="max-h-80 object-contain rounded-lg border shadow-sm" />
                            )}

                            {/* Options */}
                            <div className="mt-8">
                                <RadioGroup
                                    value={answers[currentQ.id] || ""}
                                    onValueChange={handleOptionSelect}
                                    className="space-y-4"
                                >
                                    {currentQ.options.map((opt, oIdx) => {
                                        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                                        return (
                                            <Label
                                                key={opt.id}
                                                htmlFor={opt.id}
                                                className={cn(
                                                    "flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-zinc-50",
                                                    answers[currentQ.id] === opt.id ? "border-primary bg-primary/5" : "border-zinc-200"
                                                )}
                                            >
                                                <div className="flex items-center space-x-3 w-full">
                                                    <RadioGroupItem value={opt.id} id={opt.id} className="mt-1" />
                                                    <span className="font-bold text-zinc-400 w-6 mt-0.5">{letters[oIdx]}.</span>
                                                    <div className="flex-1 text-base font-normal">
                                                        {opt.text}
                                                        {opt.imageUrl && (
                                                            <div className="mt-3">
                                                                <img src={opt.imageUrl} alt={`Option ${letters[oIdx]}`} className="max-h-40 rounded border shadow-sm" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Label>
                                        );
                                    })}
                                </RadioGroup>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Question Actions Footer */}
                    <div className="h-20 border-t bg-zinc-50 flex items-center justify-between px-6 shrink-0">
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleMarkReview} className={questionStatuses[currentQ.id]?.includes('marked_review') ? "bg-purple-50 border-purple-200 text-purple-700" : ""}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                {questionStatuses[currentQ.id]?.includes('marked_review') ? "Unmark Review" : "Mark for Review & Next"}
                            </Button>
                            <Button variant="ghost" className="text-zinc-500" onClick={handleClearResponse} disabled={!answers[currentQ.id]}>
                                Clear Response
                            </Button>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => jumpToQuestion(currentQuestionIdx - 1)}
                                disabled={currentQuestionIdx === 0}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <Button
                                className="bg-primary hover:bg-primary/90 px-8"
                                onClick={handleSaveAndNext}
                            >
                                {currentQuestionIdx === test.questions.length - 1 ? "Save" : "Save & Next"} <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Palette Area */}
                <div className="w-80 border-l bg-white flex flex-col shrink-0">
                    <div className="p-4 border-b flex items-center gap-3 bg-zinc-50">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-sm line-clamp-1">{user?.name || 'Student'}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{user?.email}</p>
                        </div>
                    </div>

                    {/* Status Legend */}
                    <div className="p-4 border-b bg-zinc-50/50 grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center">{answeredCount}</div> Answered
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">{notAnsweredCount}</div> Not Answered
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-200 border border-zinc-300 text-zinc-700 flex items-center justify-center">{notVisitedCount}</div> Not Visited
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center">{markedCount}</div> Marked
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500 text-white relative after:content-[''] after:absolute after:w-2 after:h-2 after:bg-green-400 after:rounded-full after:-bottom-0.5 after:-right-0.5 after:border after:border-white flex items-center justify-center">{answeredMarkedCount}</div> Answered & Marked for Review
                        </div>
                    </div>

                    {/* Palette Grid */}
                    <ScrollArea className="flex-1 p-4">
                        <h3 className="text-sm font-bold text-zinc-700 mb-4 px-1">Questions Palette</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {test.questions.map((q, idx) => (
                                <div
                                    key={q.id}
                                    className={getBadgeStyle(questionStatuses[q.id], currentQuestionIdx === idx)}
                                    onClick={() => jumpToQuestion(idx)}
                                >
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Submit Area */}
                    <div className="p-4 border-t bg-zinc-50 shadow-inner">
                        <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" onClick={promptSubmit} disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertOctagon className="mr-2 h-4 w-4" />}
                            SUBMIT TEST
                        </Button>
                    </div>
                </div>

            </div>

            {/* Overlay Calculator (Basic non-functional representation) */}
            {showCalculator && (
                <div className="fixed top-20 right-80 z-50 w-64 bg-zinc-900 rounded-xl shadow-2xl p-4 border border-zinc-800 text-white animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-sm text-zinc-400">Calculator</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-zinc-400 hover:text-white" onClick={() => setShowCalculator(false)}>
                            &times;
                        </Button>
                    </div>
                    <div className="h-10 bg-zinc-800 rounded mb-4 text-right px-3 py-2 font-mono text-xl">0</div>
                    <div className="grid grid-cols-4 gap-2 text-sm font-mono font-medium">
                        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map(btn => (
                            <Button key={btn} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 h-10 w-full text-zinc-200">
                                {btn}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
