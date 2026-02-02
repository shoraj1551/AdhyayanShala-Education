"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url?: string;
}

export function ShareModal({ isOpen, onClose, title, url }: ShareModalProps) {
    const [pageUrl, setPageUrl] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPageUrl(url || window.location.href);
            setCopied(false);
        }
    }, [isOpen, url]);

    const handleCopy = () => {
        navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Article</DialogTitle>
                    <DialogDescription>
                        Share this article with your friends and colleagues.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                            Link
                        </Label>
                        <Input
                            id="link"
                            readOnly
                            value={pageUrl}
                        />
                    </div>
                    <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
                        <span className="sr-only">Copy</span>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
