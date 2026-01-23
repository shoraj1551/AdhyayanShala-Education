"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
                <FileQuestion className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
                <p className="text-muted-foreground text-lg max-w-[500px]">
                    Sorry, we couldn't find the page you're looking for. It might have been removed or doesn't exist.
                </p>
            </div>
            <Link href="/dashboard">
                <Button size="lg" className="mt-4">
                    Return to Dashboard
                </Button>
            </Link>
        </div>
    );
}
