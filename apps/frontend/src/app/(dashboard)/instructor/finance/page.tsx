"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, IndianRupee, Landmark, History, TrendingUp, Eye, EyeOff, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface FinanceData {
    walletBalance: number;
    totalEarnings: number;
    bankDetails: string | null;
    payouts: Array<{
        id: string;
        amount: number;
        status: string;
        requestedAt: string;
    }>;
    earnings: Array<{
        id: string;
        amount: number;
        type: string;
        createdAt: string;
    }>;
}

export default function InstructorFinancePage() {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [financeData, setFinanceData] = useState<FinanceData | null>(null);
    const [requesting, setRequesting] = useState(false);
    const [visibility, setVisibility] = useState({
        balance: false,
        earnings: false,
        methods: false
    });

    // Bank Details State
    const [bankDetails, setBankDetails] = useState({
        accountHolder: user?.name || "",
        accountNumber: "",
        ifsc: "",
        upiId: ""
    });
    const [savingBank, setSavingBank] = useState(false);

    const fetchData = useCallback(async () => {
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
    }, [token]);

    useEffect(() => {
        if (token) fetchData();
    }, [token, fetchData]);

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
            console.error("Bank Update Error:", error);
            toast.error("Failed to update bank details");
        } finally {
            setSavingBank(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    const hasPendingPayout = financeData?.payouts?.some((p) => p.status === 'REQUESTED');
    const canWithdraw = (financeData?.walletBalance ?? 0) > 0 && !hasPendingPayout;

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Financial Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your earnings, payouts, and withdrawal preferences.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">30-Day Growth: +12.5%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Wallet Balance Card - Glassmorphism */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-md shadow-xl border border-white/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none select-none">
                        <IndianRupee className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-20">
                        <CardTitle className="text-sm font-medium text-emerald-800 uppercase tracking-wider">Available Balance</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600/70 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-full transition-colors relative z-30"
                            onClick={(e) => {
                                e.stopPropagation();
                                setVisibility(v => ({ ...v, balance: !v.balance }));
                            }}
                        >
                            {visibility.balance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black text-emerald-900 flex items-baseline gap-1">
                            <span className="text-2xl font-bold">₹</span>
                            {visibility.balance ? (financeData?.walletBalance?.toLocaleString() || "0") : "••••••"}
                        </div>
                        <Button
                            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 py-6 rounded-xl font-bold text-lg transition-all active:scale-95"
                            disabled={!canWithdraw || requesting}
                            onClick={handleRequestPayout}
                        >
                            {requesting ? <Loader2 className="animate-spin mr-2" /> : "Withdraw Funds"}
                        </Button>
                        {hasPendingPayout && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-white/50 py-1 rounded-full animate-pulse">
                                <History className="h-3 w-3" /> Payout Request in Process
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Total Earnings Card */}
                <Card className="relative overflow-hidden border-none bg-zinc-900 text-white shadow-xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50" />
                    <CardHeader className="pb-2 relative z-20 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Lifetime Earnings</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-30"
                            onClick={(e) => {
                                e.stopPropagation();
                                setVisibility(v => ({ ...v, earnings: !v.earnings }));
                            }}
                        >
                            {visibility.earnings ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-5xl font-black flex items-baseline gap-1 group-hover:scale-105 transition-transform duration-500 origin-left">
                            <span className="text-2xl font-bold text-emerald-500">₹</span>
                            {visibility.earnings ? (financeData?.totalEarnings?.toLocaleString() || "0") : "••••••"}
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-xs font-medium text-zinc-500">
                                <span>Target: ₹1,00,000</span>
                                <span>{Math.min(100, Math.round(((financeData?.totalEarnings || 0) / 100000) * 100))}%</span>
                            </div>
                            <Progress value={Math.min(100, ((financeData?.totalEarnings || 0) / 100000) * 100)} className="h-1.5 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Settings Card */}
                <Card className="shadow-lg border-zinc-100">
                    <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="flex items-center text-lg font-bold">
                            <div className="p-2 bg-zinc-100 rounded-lg mr-3">
                                <Landmark className="h-5 w-5 text-zinc-700" />
                            </div>
                            Payout Methods
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-600"
                            onClick={() => setVisibility(v => ({ ...v, methods: !v.methods }))}
                        >
                            {visibility.methods ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveBankDetails} className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase">UPI Identity</Label>
                                <Input
                                    value={visibility.methods ? bankDetails.upiId : "••••••••••••"}
                                    onChange={e => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                                    placeholder="yourname@upi"
                                    className="bg-zinc-50 border-zinc-100 h-10 focus-visible:ring-emerald-500"
                                    disabled={!visibility.methods}
                                />
                            </div>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100"></span></div>
                                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-zinc-400 font-bold tracking-widest">or Bank Account</span></div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-zinc-400 uppercase">Account Number</Label>
                                    <Input
                                        value={visibility.methods ? bankDetails.accountNumber : "••••••••••••••••"}
                                        onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                        type={visibility.methods ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        className="bg-zinc-50 border-zinc-100 h-10"
                                        disabled={!visibility.methods}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-zinc-400 uppercase">IFSC Code</Label>
                                    <Input
                                        value={visibility.methods ? bankDetails.ifsc : "•••••••••••"}
                                        onChange={e => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                                        className="bg-zinc-50 border-zinc-100 uppercase h-10"
                                        placeholder="SBIN0001234"
                                        disabled={!visibility.methods}
                                    />
                                </div>
                            </div>
                            <Button size="sm" type="submit" variant="outline" className="w-full border-zinc-200 hover:bg-zinc-50 font-bold" disabled={savingBank}>
                                {savingBank ? "Saving..." : "Update Details"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Revenue Share Information</h4>
                    <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                        Adhyayan Shala Platform maintains a 70/30 revenue split. Instructors receive 70% of the total amount paid by students (after taxes and payment gateway fees).
                        Earnings are credited instantly to your wallet upon successful enrollment.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Recent Earnings Table */}
                <Card className="lg:col-span-3 border-zinc-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center">
                                <History className="mr-3 h-5 w-5 text-emerald-600" />
                                Recent Transactions
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-semibold">View All</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-100/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold text-zinc-500 uppercase text-[10px] w-32">Date</TableHead>
                                    <TableHead className="font-bold text-zinc-500 uppercase text-[10px]">Description</TableHead>
                                    <TableHead className="text-right font-bold text-zinc-500 uppercase text-[10px]">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {financeData?.earnings?.slice(0, 10).map((e) => (
                                    <TableRow key={e.id} className="hover:bg-zinc-50/50 transition-colors border-zinc-50">
                                        <TableCell className="text-sm font-medium text-zinc-500 py-4">
                                            {format(new Date(e.createdAt), 'dd MMM yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-zinc-900">{e.type.replace(/_/g, ' ')}</span>
                                                <span className="text-xs text-zinc-400 font-medium">Platform Revenue Share</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className={cn(
                                                "inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold",
                                                e.amount > 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                                            )}>
                                                {e.amount > 0 ? '+' : ''}₹{visibility.earnings ? e.amount.toLocaleString() : "•••"}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!financeData?.earnings || financeData.earnings.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-20 text-zinc-400 font-medium italic">
                                            No earnings data found yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Payout History Section */}
                <Card className="lg:col-span-2 border-zinc-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                        <CardTitle className="text-lg font-bold">Withdrawal History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-0 divide-y divide-zinc-50">
                            {financeData?.payouts?.slice(0, 8).map((p) => (
                                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            p.status === 'PROCESSED' ? "bg-emerald-100 text-emerald-600" :
                                                p.status === 'REJECTED' ? "bg-rose-100 text-rose-600" : "bg-orange-100 text-orange-600"
                                        )}>
                                            <Landmark className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-zinc-900">₹{visibility.earnings ? p.amount.toLocaleString() : "•••"}</div>
                                            <div className="text-[10px] font-medium text-zinc-400">{format(new Date(p.requestedAt), 'dd MMM yyyy')}</div>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "rounded-lg border-none font-bold text-[10px] px-2",
                                            p.status === 'PROCESSED' ? "bg-emerald-500/10 text-emerald-600" :
                                                p.status === 'REJECTED' ? "bg-rose-500/10 text-rose-600" : "bg-orange-500/10 text-orange-600"
                                        )}
                                    >
                                        {p.status}
                                    </Badge>
                                </div>
                            ))}
                            {(!financeData?.payouts || financeData.payouts.length === 0) && (
                                <div className="text-center py-20 text-zinc-400 font-medium italic px-6">
                                    No withdrawal history available.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
