"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { InstructorClassRoom } from "@/components/InstructorClassRoom";
import { ResourcesPanel } from "@/components/ResourcesPanel";

export default function InstructorLiveClassPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const { token, user } = useAuth();

    interface Course {
        id: string;
        title: string;
        type: string;
    }

    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<Course | null>(null);
    const [roomData, setRoomData] = useState<{ roomName: string; token: string; domain: string } | null>(null);

    useEffect(() => {
        if (!token || !courseId) return;

        // Fetch course details to ensure it exists, is live, and belongs to them.
        api.get(`/courses/instructor`, token)
            .then(courses => {
                const found = courses.find((c: any) => c.id === courseId);
                if (!found) {
                    router.push("/instructor/courses");
                    return;
                }
                setCourse(found);
                if (found.type === "LIVE") {
                    // Fetch join token
                    return api.post(`/courses/${courseId}/live/token`, {}, token);
                }
            })
            .then(res => {
                if (res) setRoomData(res.data ?? res);
            })
            .catch(err => console.error("Error fetching live course token", err))
            .finally(() => setLoading(false));
    }, [token, courseId, router]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-zinc-950">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        );
    }

    if (!course) {
        return null;
    }

    if (course.type !== "LIVE") {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Not a Live Course</h2>
                <p className="text-muted-foreground mb-6">This course is not configured as a LIVE course.</p>
                <button onClick={() => router.back()} className="text-primary hover:underline">Go Back</button>
            </div>
        );
    }

    if (!roomData) {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center bg-zinc-950">
                <Loader2 className="animate-spin text-primary h-8 w-8 mb-4 bg-zinc-950" />
                <p className="text-zinc-400">Initializing Live Session...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-zinc-950 overflow-hidden">
            <InstructorClassRoom
                courseId={course.id}
                roomName={roomData.roomName}
                token={roomData.token}
                domain={roomData.domain}
                instructorName={(user as { name?: string })?.name || "Instructor"}
                authToken={token || ""}
                onClose={() => router.push("/instructor/courses")}
            />
            <ResourcesPanel courseId={course.id} brochureUrl={course.brochureUrl} authToken={token || ""} />
        </div>
    );
}
