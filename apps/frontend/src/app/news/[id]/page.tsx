"use client";

import { useParams, useRouter } from "next/navigation";
import { newsData } from "@/lib/news-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Share2, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { RegistrationModal } from "@/components/registration-modal";
import { ShareModal } from "@/components/share-modal";
import { toast } from "sonner"; // Assuming sonner is installed or handle with alert

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const newsItem = newsData.find((item) => item.id === id);

    if (!newsItem) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">News Item Not Found</h1>
                <Button onClick={() => router.push('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </div>
        );
    }

    const handleRegisterClick = () => {
        if (newsItem.type === "Notice") {
            // Navigate to instructor page
            router.push(newsItem.registerLink || "/instructor/register");
        } else {
            // Open modal for Course/Workshop
            setIsModalOpen(true);
        }
    };

    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={newsItem.title}
                type={newsItem.type as "Workshop" | "Course"}
                price={newsItem.price}
            />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={newsItem.title}
            />

            {/* Header / Hero */}
            <div className="bg-secondary/5 border-b relative overflow-hidden">
                <div className="container px-4 py-8 relative z-10">
                    <Button variant="ghost" onClick={() => router.push('/')} className="mb-6 hover:bg-transparent hover:text-primary pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                                {newsItem.type}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-4 w-4" /> {newsItem.date}
                            </span>
                            {newsItem.price && (
                                <span className="text-sm font-bold text-green-600 flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
                                    <Tag className="h-4 w-4" /> {newsItem.price}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 max-w-3xl">
                            {newsItem.title}
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="container px-4 py-12 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: newsItem.fullContent }}
                />

                <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button onClick={handleRegisterClick} size="lg" className="w-full sm:w-auto px-8 text-lg font-semibold shadow-lg shadow-primary/20">
                            {newsItem.registerLabel || "Register Now"}
                        </Button>
                    </div>

                    <Button variant="outline" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-foreground">
                        <Share2 className="mr-2 h-4 w-4" /> Share Article
                    </Button>
                </div>
            </div>
        </div>
    );
}
