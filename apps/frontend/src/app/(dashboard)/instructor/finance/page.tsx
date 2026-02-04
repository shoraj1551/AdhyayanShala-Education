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
import { toast } from "sonner";
import { Loader2, IndianRupee, Landmark, History, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function InstructorFinancePage() {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [financeData, setFinanceData] = useState<any>(null);
    const [requesting, setRequesting] = useState(false);

    // Bank Details State
    const [bankDetails, setBankDetails] = useState({
        accountHolder: user?.name || "",
        accountNumber: "",
        ifsc: "",
        upiId: ""
    });
    const [savingBank, setSavingBank] = useState(false);

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await api.get('/finance/instructor', token ?? undefined);
            setFinanceData(data);
            if (data.bankDetails) {
                const details = JSON.parse(data.bankDetails);
                setBankDetails(prev => ({ ...prev, ...details }));
            }
        } catch (error: any) {
            console.error("Finance Fetch Error:", error);
            const msg = error.message || "Failed to load finance data";
            toast.error(msg === "Failed to fetch" ? "Network Error: Cannot reach server" : msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleRequestPayout = async () => {
        if (!token) return;
        if (!confirm("Are you sure you want to request a payout?")) return;
        setRequesting(true);
        try {
            await api.post('/finance/instructor/payout', {}, token ?? undefined);
            toast.success("Payout requested successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to request payout");
        } finally {
            setRequesting(false);
        }
    };

    const handleSaveBankDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSavingBank(true);
        try {
            await api.put('/finance/instructor/bank', bankDetails, token ?? undefined);
            toast.success("Bank details updated");
            fetchData();
        } catch (error) {
            toast.error("Failed to update bank details");
        } finally {
            setSavingBank(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    const hasPendingPayout = financeData?.payouts?.some((p: any) => p.status === 'REQUESTED');
    const canWithdraw = financeData?.walletBalance > 0 && !hasPendingPayout;

    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold">My Earnings & Payouts</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-emerald-800">Wallet Balance</CardTitle>
                        <CardDescription className="text-emerald-700">Available for withdrawal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-emerald-900 flex items-center">
                            <IndianRupee className="h-8 w-8 mr-1" />
                            {financeData?.walletBalance?.toLocaleString()}
                        </div>
                        <Button
                            className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800"
                            disabled={!canWithdraw || requesting}
                            onClick={handleRequestPayout}
                        >
                            {requesting ? <Loader2 className="animate-spin mr-2" /> : "Request Withdrawal"}
                        </Button>
                        {hasPendingPayout && <p className="text-xs text-center mt-2 text-emerald-800 font-medium">Payout Pending...</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Earnings</CardTitle>
                        <CardDescription>Lifetime revenue share</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold flex items-center text-zinc-700">
                            <IndianRupee className="h-8 w-8 mr-1" />
                            {financeData?.totalEarnings?.toLocaleString()}
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                            Keep creating great content!
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Landmark className="mr-2 h-5 w-5" /> Payout Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveBankDetails} className="space-y-3">
                            <div>
                                <Label className="text-xs">UPI ID</Label>
                                <Input
                                    value={bankDetails.upiId}
                                    onChange={e => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                                    placeholder="user@upi"
                                    className="h-8"
                                />
                            </div>
                            <div className="text-xs text-center text-muted-foreground">- OR -</div>
                            <div>
                                <Label className="text-xs">Account Number</Label>
                                <Input
                                    value={bankDetails.accountNumber}
                                    onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    type="password"
                                    className="h-8"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">IFSC Code</Label>
                                <Input
                                    value={bankDetails.ifsc}
                                    onChange={e => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                                    className="h-8 uppercase"
                                />
                            </div>
                            <Button size="sm" type="submit" variant="secondary" className="w-full" disabled={savingBank}>
                                {savingBank ? "Saving..." : "Update Details"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5" /> Recent Earnings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[300px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {financeData?.earnings?.map((e: any) => (
                                        <TableRow key={e.id}>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(e.createdAt), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell className="text-xs">{e.type.replace('_', ' ')}</TableCell>
                                            <TableCell className={`text-right font-medium ${e.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {e.amount > 0 ? '+' : ''}{e.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!financeData?.earnings || financeData.earnings.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">No earnings yet</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payout History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[300px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Ref ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {financeData?.payouts?.map((p: any) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(p.requestedAt), 'dd MMM')}
                                            </TableCell>
                                            <TableCell className="text-xs font-mono">{p.transactionRef || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={p.status === 'PROCESSED' ? 'default' : p.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                    {p.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                ₹{p.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!financeData?.payouts || financeData.payouts.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">No payout history</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
