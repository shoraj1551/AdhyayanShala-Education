"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export function PayoutSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payout Settings</CardTitle>
                <CardDescription>Securely connect your account to receive earnings directly to your bank or UPI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* UPI Section */}
                <div className="p-4 border rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-12 bg-white rounded flex items-center justify-center p-0.5">
                                    {/* Text based UPI logo placeholder */}
                                    <span className="text-[10px] font-bold text-orange-600 tracking-tighter">BHIM UPI</span>
                                </div>
                                <h3 className="font-semibold text-white">UPI Payment</h3>
                            </div>
                            <p className="text-sm text-zinc-400">Instant transfer to your localized payment address.</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 rounded border border-green-500/20">Recommended</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Input
                            placeholder="username@okhdfcbank"
                            className="bg-zinc-950/50 border-white/10"
                        />
                        <Button variant="secondary" className="bg-orange-600 hover:bg-orange-700 text-white border-none">Verify</Button>
                    </div>
                </div>

                {/* Bank Transfer Section */}
                <div className="p-4 border rounded-xl bg-muted/20">
                    <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="h-5 w-5 text-blue-400" />
                        <h3 className="font-semibold text-white">Bank Transfer (NEFT/IMPS)</h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Account Holder Name</Label>
                            <Input placeholder="As per bank records" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Account Number</Label>
                            <Input type="password" placeholder="•••• •••• •••• 1234" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">IFSC Code</Label>
                            <Input placeholder="HDFC0001234" className="uppercase" maxLength={11} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Bank Name</Label>
                            <Input placeholder="e.g. HDFC Bank" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="outline">Save Bank Details</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
