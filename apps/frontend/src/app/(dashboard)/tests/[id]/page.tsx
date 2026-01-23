"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import TestRunner from "@/components/TestRunner";

export default function TestPage() {
    const params = useParams();
    const { token } = useAuth();
    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (token && params.id) {
            api.get(`/tests/${params.id}`, token)
                .then(data => setTest(data))
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [token, params.id]);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Assessment...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-destructive">Error: {error}</div>;
    if (!test) return <div className="flex h-screen items-center justify-center">Test not found</div>;

    return (
        <div className="container mx-auto px-4">
            <TestRunner test={test} />
        </div>
    );
}
