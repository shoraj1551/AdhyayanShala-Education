"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, IndianRupee, CheckCircle, XCircle, Search } from "lucide-react";
import { format } from "date-fns";

export default function AdminPayoutsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState("REQUESTED");

    // Processing State
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [transactionRef, setTransactionRef] = useState("");
    const [processing, setProcessing] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/admin/finance/payouts?status=${statusFilter === 'ALL' ? '' : statusFilter}`, token!);
            setPayouts(data);
        } catch (error) {
            toast.error("Failed to fetch payouts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPayouts();
    }, [token, statusFilter]);

    const handleProcess = async (action: 'APPROVE' | 'REJECT') => {
        if (!selectedPayout) return;
        if (action === 'APPROVE' && !transactionRef) {
            toast.error("Transaction Reference is required for approval");
            return;
        }

        setProcessing(true);
        try {
            await api.post(`/admin/finance/payouts/${selectedPayout.id}/process`, {
                action,
                transactionRef: action === 'APPROVE' ? transactionRef : undefined
            }, token!);

            toast.success(action === 'APPROVE' ? "Payout approved successfully" : "Payout rejected");
            setIsApproveOpen(false);
            setTransactionRef("");
            setSelectedPayout(null);
            fetchPayouts();
        } catch (error: any) {
            toast.error(error.message || "Processing failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold">Payout Management</h1>

            <div className="flex gap-2 mb-4">
                {['REQUESTED', 'PROCESSED', 'REJECTED', 'ALL'].map(status => (
                    <Button
                        key={status}
                        variant={statusFilter === status ? "default" : "outline"}
                        onClick={() => setStatusFilter(status)}
                        disabled={loading}
                    >
                        {status}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payout Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Bank Details</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <Loader2 className="animate-spin h-6 w-6 mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : payouts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No payouts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payouts.map((p) => {
                                    const bank = p.instructor?.bankDetails ? JSON.parse(p.instructor.bankDetails) : null;
                                    return (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{p.instructor?.name}</span>
                                                    <span className="text-xs text-muted-foreground">{p.instructor?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {bank ? (
                                                    <div className="text-xs space-y-1">
                                                        {bank.upiId && <div>UPI: {bank.upiId}</div>}
                                                        {bank.accountNumber && <div>Acc: {bank.accountNumber}</div>}
                                                        {bank.ifsc && <div>IFSC: {bank.ifsc}</div>}
                                                    </div>
                                                ) : <span className="text-xs text-red-500">Not provided</span>}
                                            </TableCell>
                                            <TableCell className="font-bold">₹{p.amount}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(p.requestedAt), 'dd MMM HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={p.status === 'PROCESSED' ? 'default' : p.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                    {p.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {p.status === 'REQUESTED' && (
                                                    <div className="flex gap-2">
                                                        <Dialog open={isApproveOpen && selectedPayout?.id === p.id} onOpenChange={(o) => {
                                                            setIsApproveOpen(o);
                                                            if (o) setSelectedPayout(p);
                                                            else { setSelectedPayout(null); setTransactionRef(""); }
                                                        }}>
                                                            <DialogTrigger asChild>
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Pay</Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Details for Transfer</DialogTitle>
                                                                    <DialogDescription>
                                                                        Manually transfer <b>₹{p.amount}</b> to the details below, then enter the Transaction Reference ID.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="bg-muted p-4 rounded-md text-sm mb-4">
                                                                    {bank?.upiId && <p><strong>UPI:</strong> {bank.upiId}</p>}
                                                                    {bank?.accountNumber && <p><strong>Acc No:</strong> {bank.accountNumber}</p>}
                                                                    {bank?.ifsc && <p><strong>IFSC:</strong> {bank.ifsc}</p>}
                                                                    <p><strong>Holder:</strong> {bank?.accountHolder || p.instructor?.name}</p>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Transaction Reference ID</Label>
                                                                    <Input
                                                                        placeholder="e.g. UPI Ref, NEFT UTR..."
                                                                        value={transactionRef}
                                                                        onChange={(e) => setTransactionRef(e.target.value)}
                                                                    />
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
                                                                    <Button onClick={() => handleProcess('APPROVE')} disabled={processing || !transactionRef}>
                                                                        {processing ? 'Confirming...' : 'Confirm Payment'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => {
                                                                if (confirm("Reject this payout request? Money will be refunded to wallet.")) {
                                                                    setSelectedPayout(p);
                                                                    handleProcess('REJECT');
                                                                }
                                                            }}
                                                            disabled={processing}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                                {p.status === 'PROCESSED' && (
                                                    <div className="text-xs text-green-600 flex flex-col">
                                                        <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Paid</span>
                                                        <span className="text-[10px] text-muted-foreground">{p.transactionRef}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
