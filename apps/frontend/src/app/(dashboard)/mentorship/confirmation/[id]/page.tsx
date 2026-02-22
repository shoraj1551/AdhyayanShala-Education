"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function BookingConfirmationPage() {
    const params = useParams();
    const { token } = useAuth();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.id || !token) return;
        // Fetch all my sessions and find this one
        api.get("/mentorship/sessions", token).then(res => {
            const found = res.find((s: any) => s.id === params.id);
            setBooking(found);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [params.id, token]);

    if (loading) {
        return <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    if (!booking) {
        return <div className="p-20 text-center font-bold text-xl">Booking not found!</div>;
    }

    const { instructor, date, startTime, duration, isFree, amountPaid } = booking;
    const bookingDate = new Date(date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });

    // Raw HTML markup exactly as user provided, injected with React data
    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101622] font-sans text-slate-900 dark:text-slate-100 antialiased min-h-screen py-10">
            <div className="max-w-[600px] mx-auto bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Header / Logo */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-3xl">star_rate</span>
                        <h1 className="text-xl font-bold tracking-tight">ShorajLearning</h1>
                    </div>
                    <div className="text-slate-500 text-sm font-medium">Confirmation #{booking.id.split('-')[0].toUpperCase()}</div>
                </div>

                {/* Hero Content */}
                <div className="px-8 pt-8 text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-600/10 text-blue-600 rounded-full mb-4">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">You&apos;re all set!</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Your mentorship session has been successfully booked. We&apos;ve added this to your calendar and sent a notification to your mentor {instructor.name}.
                    </p>
                </div>

                {/* Session Card */}
                <div className="px-8 py-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                                {instructor.avatar ? (
                                    <img className="w-full h-full object-cover" src={instructor.avatar} alt="Mentor" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-primary/20 text-primary">
                                        {instructor.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold">Session with {instructor.name}</h3>
                                        <p className="text-blue-600 font-medium text-sm flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">verified</span>
                                            Premium Mentor
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400">calendar_today</span>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date</p>
                                            <p className="font-semibold">{bookingDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400">schedule</span>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Time &amp; Duration</p>
                                            <p className="font-semibold">{startTime} ({duration} Min)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <a href={booking.meetingLink || "#"} target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                <span className="material-symbols-outlined">video_call</span>
                                Join Session
                            </a>
                            <p className="text-center text-xs text-slate-500 mt-3 italic">Link becomes active 5 minutes before the start time.</p>
                        </div>
                    </div>
                </div>

                {/* Billing Summary */}
                <div className="px-8 py-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Payment Summary</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Session Fee (1 hr)</span>
                            <span className="font-medium">₹{isFree ? "1,000.00" : amountPaid.toFixed(2)}</span>
                        </div>

                        {isFree && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">sell</span>
                                    Student Free Tier
                                </span>
                                <span className="font-medium">-₹1,000.00</span>
                            </div>
                        )}

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-lg font-bold">Total Amount Paid</span>
                            <span className="text-2xl font-bold text-blue-600">₹{amountPaid.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Preparation Tips */}
                <div className="px-8 py-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Preparing for your session</h4>
                    <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">check_circle</span>
                            <span>Test your microphone and camera settings beforehand to ensure a smooth start.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">check_circle</span>
                            <span>Have your questions or specific topics ready to make the most of the {duration} minutes.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">check_circle</span>
                            <span>Use a quiet environment with a stable internet connection for the best experience.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
            `}</style>
        </div>
    );
}
