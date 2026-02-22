"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminInquiries, updateAdminInquiryStatus, deleteAdminInquiry } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Inquiry {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    status: string;
    createdAt: string;
}

export function InquiryManager() {
    const { token } = useAuth();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInquiries = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAdminInquiries(token || "");
            setInquiries(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load inquiries");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateAdminInquiryStatus(id, newStatus, token || "");
            setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i));
            toast.success(`Marked as ${newStatus}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this inquiry?")) return;
        try {
            await deleteAdminInquiry(id, token || "");
            setInquiries(inquiries.filter(i => i.id !== id));
            toast.success("Inquiry deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete inquiry");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'NEW': return <Badge variant="destructive">New</Badge>;
            case 'READ': return <Badge variant="secondary">Read</Badge>;
            case 'REPLIED': return <Badge variant="default">Replied</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Contact Inquiries</CardTitle>
                        <CardDescription>Manage messages from the contact form</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchInquiries}>
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading inquiries...</div>
                ) : inquiries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No inquiries found.</div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.map((inquiry) => (
                                    <TableRow key={inquiry.id}>
                                        <TableCell className="whitespace-nowrap flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            {new Date(inquiry.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{inquiry.name}</div>
                                            <div className="text-xs text-muted-foreground">{inquiry.email}</div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {inquiry.subject || "(No Subject)"}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        if (inquiry.status === 'NEW') handleStatusUpdate(inquiry.id, 'READ');
                                                    }}>
                                                        View
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>{inquiry.subject || "Contact Inquiry"}</DialogTitle>
                                                        <DialogDescription>
                                                            From: {inquiry.name} ({inquiry.email}) on {new Date(inquiry.createdAt).toLocaleString()}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="mt-4 p-4 bg-muted/50 rounded-md whitespace-pre-wrap">
                                                        {inquiry.message}
                                                    </div>
                                                    <div className="mt-4 flex justify-end gap-2">
                                                        <Button variant="outline" onClick={() => handleStatusUpdate(inquiry.id, 'NEW')}>
                                                            Mark Unread
                                                        </Button>
                                                        <Button onClick={() => handleStatusUpdate(inquiry.id, 'REPLIED')}>
                                                            Mark Replied
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => handleDelete(inquiry.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
