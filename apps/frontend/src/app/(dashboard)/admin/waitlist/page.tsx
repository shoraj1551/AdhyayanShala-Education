"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminSubscribers, updateAdminSubscriber, deleteAdminSubscriber } from "@/lib/api";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Loader2,
    Mail,
    UserCheck,
    Trash2,
    Search,
    Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function WaitlistDashboard() {
    const { token } = useAuth();
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        if (token) fetchSubscribers();
    }, [token]);

    const fetchSubscribers = async () => {
        try {
            const data = await getAdminSubscribers(token!);
            setSubscribers(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load waitlist");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateAdminSubscriber(id, { status }, token!);
            toast.success(`Status updated to ${status}`);
            setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this entry?")) return;
        try {
            await deleteAdminSubscriber(id, token!);
            toast.success("Entry removed");
            setSubscribers(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            toast.error("Failed to delete entry");
        }
    };

    const filteredSubscribers = subscribers.filter(s => {
        const matchesSearch = s.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === "ALL" || s.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING": return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
            case "APPROVED": return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Approved</Badge>;
            case "CONTACTED": return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Contacted</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Waitlist Management</h1>
                    <p className="text-muted-foreground mt-1">Manage leads and newsletter subscribers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">Total: {subscribers.length}</Badge>
                    <Badge variant="outline" className="px-3 py-1 text-emerald-500 border-emerald-500/20">Approved: {subscribers.filter(s => s.status === 'APPROVED').length}</Badge>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
                <CardHeader className="pb-0 pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by email..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All States</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="CONTACTED">Contacted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0 mt-6">
                    <div className="rounded-md border-t">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                                <TableRow>
                                    <TableHead className="w-[300px]">Subscriber</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubscribers.length > 0 ? filteredSubscribers.map((s) => (
                                    <TableRow key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/5 rounded-full">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                </div>
                                                {s.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(s.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</TableCell>
                                        <TableCell>{getStatusBadge(s.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Select
                                                    value={s.status}
                                                    onValueChange={(val) => handleUpdateStatus(s.id, val)}
                                                >
                                                    <SelectTrigger className="h-8 w-[130px] text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="APPROVED">Approve</SelectItem>
                                                        <SelectItem value="CONTACTED">Mark Contacted</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(s.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            No subscribers found matching your search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
