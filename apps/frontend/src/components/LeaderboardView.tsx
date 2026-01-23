
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LeaderboardViewProps {
    testId: string;
    token: string | null;
    currentScore?: number;
}

export function LeaderboardView({ testId, token, currentScore }: LeaderboardViewProps) {
    const [leaders, setLeaders] = useState<any[]>([]);

    useEffect(() => {
        if (token) {
            api.get(`/tests/${testId}/leaderboard`, token)
                .then(setLeaders)
                .catch(console.error);
        }
    }, [testId, token]);

    if (leaders.length === 0) return null;

    return (
        <Card className="border-2 border-yellow-400 bg-yellow-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">🏆 Leaderboard (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {leaders.map((l, i) => (
                        <div key={l.id} className={cn("flex justify-between p-2 rounded items-center", i === 0 ? "bg-yellow-100 font-bold border-yellow-300 border" : "bg-white border")}>
                            <div className="flex gap-3 items-center">
                                <span className={cn("w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold", i === 0 ? "bg-yellow-400 text-yellow-900" : "bg-gray-100")}>
                                    {i + 1}
                                </span>
                                <span>{l.user.name || l.user.email}</span>
                            </div>
                            <span className="font-mono font-bold">{l.score} pts</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
