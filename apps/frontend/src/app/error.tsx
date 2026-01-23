"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 bg-red-100 rounded-full dark:bg-red-900/20">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
                <p className="text-muted-foreground text-lg max-w-[500px]">
                    We encountered an unexpected error. Please try again.
                </p>
            </div>
            <div className="flex gap-4 mt-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Reload Page
                </Button>
                <Button onClick={() => reset()}>Try Again</Button>
            </div>
        </div>
    );
}
