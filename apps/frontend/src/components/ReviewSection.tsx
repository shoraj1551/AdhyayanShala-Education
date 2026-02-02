
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Star, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        name: string;
        avatar?: string;
    };
}

interface ReviewSectionProps {
    courseId: string;
}

export function ReviewSection({ courseId }: ReviewSectionProps) {
    const { token, user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [myRating, setMyRating] = useState(5);
    const [myComment, setMyComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const data = await api.get(`/reviews/${courseId}`);
            setReviews(data.reviews);
            setRatingStats(data.rating);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchReviews();
        }
    }, [courseId]);

    const handleSubmit = async () => {
        if (!token) return alert("Please login to review.");
        setSubmitting(true);
        try {
            await api.post(`/reviews/${courseId}`, { rating: myRating, comment: myComment }, token);
            setMyComment("");
            fetchReviews(); // Refresh
        } catch (error) {
            alert("Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading reviews...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Rating Summary */}
                <div className="w-full md:w-1/3 space-y-4">
                    <div className="text-center md:text-left">
                        <div className="text-5xl font-bold text-yellow-500 mb-2">{ratingStats.average.toFixed(1)}</div>
                        <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-500 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`h-5 w-5 ${star <= Math.round(ratingStats.average) ? "fill-current" : "text-gray-300"}`} />
                            ))}
                        </div>
                        <p className="text-muted-foreground">{ratingStats.count} Reviews</p>
                    </div>
                </div>

                {/* Review Form */}
                {token && (
                    <div className="w-full md:w-2/3 bg-muted/30 p-6 rounded-lg border">
                        <h4 className="font-semibold mb-4">Leave a Review</h4>
                        <div className="flex items-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setMyRating(star)} className="focus:outline-none">
                                    <Star className={`h-6 w-6 ${star <= myRating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`} />
                                </button>
                            ))}
                        </div>
                        <Textarea
                            placeholder="Share your experience..."
                            value={myComment}
                            onChange={(e) => setMyComment(e.target.value)}
                            className="mb-4 bg-background"
                        />
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Posting..." : "Post Review"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Review List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src={review.user.avatar} />
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h5 className="font-semibold">{review.user.name || "Student"}</h5>
                                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex text-yellow-500 h-4 w-4 gap-0.5 mb-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} className={`h-3 w-3 ${star <= review.rating ? "fill-current" : "text-gray-300"}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {reviews.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No reviews yet. Be the first to review!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
