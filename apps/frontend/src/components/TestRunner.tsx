'use client';

import { useState } from 'react';
import { Test, Question, Option } from '@shoraj/shared';
import { submitTest } from '@/lib/api';
import Link from 'next/link';

export default function TestRunner({ test }: { test: Test }) {
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSelect = (questionId: string, optionId: string) => {
        if (result) return; // Disable changes after submission
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < test.questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }

        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qid, oid]) => ({
                questionId: qid,
                optionId: oid
            }));

            const res = await submitTest(test.id, formattedAnswers);
            setResult(res);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            alert('Error submitting test');
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className={`p-6 rounded-md border ${result.attempt.passed ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                    <h2 className="text-2xl font-medium mb-2">
                        {result.attempt.passed ? 'Passed! 🎉' : 'Keep practicing'}
                    </h2>
                    <p className="text-muted-foreground">
                        You scored <span className="font-bold text-foreground">{result.attempt.score}</span> / {result.totalPoints} points.
                    </p>
                    <div className="mt-4">
                        <Link href="/courses" className="text-sm font-medium underline">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                <div className="space-y-8">
                    {test.questions.map((q, idx) => {
                        const reflection = result.reflections.find((r: any) => r.questionId === q.id);
                        const isCorrect = reflection?.isCorrect;
                        const userAnswerId = answers[q.id];

                        return (
                            <div key={q.id} className={`p-6 border rounded-sm ${isCorrect ? 'border-border' : 'border-red-200'}`}>
                                <p className="font-medium text-lg mb-4">
                                    {idx + 1}. {q.text}
                                </p>
                                <div className="space-y-2">
                                    {q.options.map((opt) => {
                                        const isSelected = userAnswerId === opt.id;
                                        const isActuallyCorrect = reflection?.correctOptionId === opt.id;

                                        let className = "p-3 rounded border border-transparent block w-full text-left ";

                                        if (isActuallyCorrect) {
                                            className += "bg-green-100/50 border-green-200 text-green-900 font-medium";
                                        } else if (isSelected && !isActuallyCorrect) {
                                            className += "bg-red-100/50 border-red-200 text-red-900";
                                        } else {
                                            className += "opacity-50";
                                        }

                                        return (
                                            <div key={opt.id} className={className}>
                                                {opt.text}
                                                {isActuallyCorrect && " ✓"}
                                                {isSelected && !isActuallyCorrect && " ✕"}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground bg-muted/20 p-4 rounded">
                                    <span className="font-semibold text-foreground">Explanation: </span>
                                    {reflection?.explanation}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-12 max-w-3xl mx-auto">
            {test.questions.map((q, idx) => (
                <div key={q.id} className="space-y-4">
                    <h3 className="text-lg font-medium">
                        <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                        {q.text}
                    </h3>
                    <div className="space-y-2 pl-6">
                        {q.options.map((opt) => (
                            <label
                                key={opt.id}
                                className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-all ${answers[q.id] === opt.id ? 'border-foreground bg-muted/30 shadow-sm' : 'border-border hover:bg-muted/10'}`}
                            >
                                <input
                                    type="radio"
                                    name={q.id}
                                    value={opt.id}
                                    checked={answers[q.id] === opt.id}
                                    onChange={() => handleSelect(q.id, opt.id)}
                                    className="mt-1 accent-foreground"
                                />
                                <span className="leading-relaxed">{opt.text}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            <div className="pt-8 text-center">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-foreground text-background px-8 py-3 rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-opacity w-full md:w-auto"
                >
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
            </div>
        </div>
    );
}
