
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminManualPayments() {
    const { token } = useAuth();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingPayments();
    }, [token]);

    const fetchPendingPayments = async () => {
        try {
            const res = await api.get("/payments/manual/pending", token!);
            setPayments(res.data || res);
        } catch {
            toast.error("Failed to load pending payments");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (paymentId: string, status: 'SUCCESS' | 'FAILED', adminNote?: string) => {
        setProcessingId(paymentId);
        try {
            await api.post(`/payments/manual/verify/${paymentId}`, { status, adminNote }, token!);
            toast.success(`Payment ${status === 'SUCCESS' ? 'verified' : 'rejected'} successfully`);
            setPayments(prev => prev.filter(p => p.id !== paymentId));
        } catch {
            toast.error("Failed to process payment");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manual Payment Verifications</h1>
                <Badge variant="outline" className="text-zinc-400">{payments.length} Pending</Badge>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Student</TableHead>
                            <TableHead className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Course</TableHead>
                            <TableHead className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Amount</TableHead>
                            <TableHead className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Proof</TableHead>
                            <TableHead className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Details</TableHead>
                            <TableHead className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-zinc-500">No pending payments found</TableCell>
                            </TableRow>
                        ) : (
                            payments.map((p) => (
                                <TableRow key={p.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableCell>
                                        <p className="font-semibold">{p.user.name}</p>
                                        <p className="text-xs text-zinc-500">{p.user.email}</p>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">{p.course.title}</TableCell>
                                    <TableCell className="font-mono text-emerald-400">₹{p.amount}</TableCell>
                                    <TableCell>
                                        {p.proofUrl ? (
                                            <Button
                                                variant="outline"
                                                size="xs"
                                                className="h-7 text-xs gap-1.5"
                                                onClick={() => window.open(p.proofUrl, "_blank")}
                                            >
                                                <Eye className="h-3 w-3" /> View Proof
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-zinc-600 italic">No Upload</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-xs font-mono text-zinc-400">{p.transactionId || "N/A"}</p>
                                        <p className="text-[10px] text-zinc-600">{format(new Date(p.createdAt), "dd MMM, hh:mm a")}</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                className="h-8 w-8 p-0 border-zinc-700 text-red-500 hover:bg-red-500/10"
                                                disabled={processingId === p.id}
                                                onClick={() => {
                                                    const reason = prompt("Enter rejection reason (optional):");
                                                    if (reason !== null) handleVerify(p.id, 'FAILED', reason);
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="default"
                                                className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                                                disabled={processingId === p.id}
                                                onClick={() => handleVerify(p.id, 'SUCCESS')}
                                            >
                                                {processingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
