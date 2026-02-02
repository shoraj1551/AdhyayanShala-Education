
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Megaphone, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface News {
    id: string;
    title: string;
    content: string;
    type: string;
    createdAt: string;
}

export function NewsTicker() {
    const [news, setNews] = useState<News[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        api.get('/courses/announcements')
            .then(setNews)
            .catch(err => console.error("Failed to fetch news", err));
    }, []);

    if (!isVisible || news.length === 0) return null;

    return (
        <div className="bg-indigo-600 text-white px-4 py-2 relative overflow-hidden">
            <div className="container mx-auto flex items-center gap-4">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider bg-indigo-800 px-2 py-1 rounded shrink-0">
                    <Megaphone className="h-3 w-3" />
                    Latest News
                </div>

                <div className="flex-1 overflow-hidden relative h-6">
                    <div className="animate-marquee whitespace-nowrap absolute top-0 flex gap-8 items-center">
                        {news.map((item) => (
                            <span key={item.id} className="text-sm font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
                                {item.title}: {item.content}
                            </span>
                        ))}
                        {/* Duplicate for infinite loop illusion if needed, or CSS animation handles it */}
                    </div>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="shrink-0 hover:bg-indigo-700 rounded-full p-1 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                    width: 100%; /* Or auto based on content */
                }
                /* Pause on hover */
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
