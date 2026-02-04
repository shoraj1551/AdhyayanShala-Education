"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Search, Loader2, ArrowUpRight, ArrowDownLeft, RefreshCcw, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
    id: string;
    amount: number;
    status: string;
    provider: string;
    providerPaymentId: string;
    providerOrderId: string;
    createdAt: string;
    user: { name: string; email: string };
    course: { title: string };
}

export default function AdminFinancePage() {
    const { token, isLoading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTransactions = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                search: searchQuery
            });
            const data = await api.get(`/admin/finance/transactions?${query}`, token);
            setTransactions(data.transactions);
            setTotalPages(data.totalPages);
            setTotalRevenue(data.totalRevenue);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading || !token) return;
        const timer = setTimeout(() => {
            fetchTransactions();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, searchQuery, token, authLoading]);

    const handleRefund = async (id: string) => {
        if (!confirm("Are you sure you want to mark this as REFUNDED?")) return;
        try {
            await api.post(`/admin/finance/transactions/${id}/refund`, {}, token!);
            toast.success("Transaction marked as refunded");
            fetchTransactions();
        } catch (error) {
            toast.error("Refund failed");
        }
    };

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Control Center</h1>
                    <p className="text-muted-foreground">Monitor revenue, track transactions, and manage reconciliations.</p>
                </div>
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Total Revenue (Verified)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900 flex items-center">
                            <IndianRupee className="h-6 w-6 mr-1" />
                            {totalRevenue.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search Payment ID, Order ID, or User Email..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>User / Course</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading ledger...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((txn) => (
                                        <TableRow key={txn.id}>
                                            <TableCell className="font-mono text-xs">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-primary">{txn.providerPaymentId || 'N/A'}</span>
                                                    <span className="text-muted-foreground">{txn.provider}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-medium">{txn.user?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">{txn.course?.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                ₹{txn.amount}
                                            </TableCell>
                                            <TableCell>
                                                {txn.status === 'SUCCESS' ? (
                                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">Success</Badge>
                                                ) : txn.status === 'REFUNDED' ? (
                                                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">Refunded</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Failed</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(new Date(txn.createdAt), 'dd MMM yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {txn.status === 'SUCCESS' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRefund(txn.id)}
                                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                    >
                                                        <RefreshCcw className="h-4 w-4 mr-1" /> Refund
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
