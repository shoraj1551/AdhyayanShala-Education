"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, CheckCircle, XCircle, Trash2, Mail } from "lucide-react";

interface Subscriber {
    id: string;
    email: string;
    status: string;
    isActive: boolean;
    createdAt: string;
}

export function SubscriberManager() {
    const { token } = useAuth();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const data = await api.admin.subscribers.get(token!);
            setSubscribers(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch subscribers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSubscribers();
    }, [token]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await api.admin.subscribers.update(id, { status: newStatus }, token!);
            toast.success(`Subscriber status updated to ${newStatus}`);
            fetchSubscribers();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this subscriber?")) return;
        try {
            await api.admin.subscribers.delete(id, token!);
            toast.success("Subscriber removed");
            fetchSubscribers();
        } catch (error: any) {

            toast.error(error.message || "Failed to delete subscriber");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge className="bg-emerald-500 text-white border-none uppercase text-[10px]">Approved</Badge>;
            case 'PENDING': return <Badge variant="secondary" className="uppercase text-[10px]">Pending</Badge>;
            case 'CONTACTED': return <Badge className="bg-blue-500 text-white border-none uppercase text-[10px]">Contacted</Badge>;
            default: return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
        }
    };

    return (
        <Card className="border-none shadow-md bg-white/40 backdrop-blur-md">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Waitlist & Newsletter Subscribers
                        </CardTitle>
                        <CardDescription>Manage approvals and status for individuals on the waitlist.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchSubscribers}>Refresh</Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
                ) : subscribers.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">No subscribers found.</div>
                ) : (
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50">
                                <TableRow>
                                    <TableHead>Email Address</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscribers.map((sub) => (
                                    <TableRow key={sub.id} className="hover:bg-zinc-50/50">
                                        <TableCell className="font-medium underline decoration-primary/20">{sub.email}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(sub.createdAt), 'PPP')}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {sub.status === 'PENDING' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => handleUpdateStatus(sub.id, 'APPROVED')}
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(sub.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
