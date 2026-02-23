
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, QrCode, Building2, Upload, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const { token, user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [course, setCourse] = useState<any>(null);
    const [transactionId, setTransactionId] = useState("");
    const [proofUrl, setProofUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!courseId) return;
        api.get(`/courses/${courseId}`, token)
            .then(res => setCourse(res.data || res))
            .catch(err => toast.error("Failed to load course details"))
            .finally(() => setLoading(false));
    }, [courseId, token]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await api.upload(file, token!);
            setProofUrl(res.url);
            toast.success("Screenshot uploaded!");
        } catch {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofUrl && !transactionId) {
            toast.error("Please provide a transaction ID or upload a screenshot");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/payments/manual/submit`, {
                courseId,
                transactionId,
                proofUrl,
                amount: course.price
            }, token!);
            toast.success("Payment proof submitted! Redirecting to dashboard...");
            setTimeout(() => router.push("/dashboard"), 2000);
        } catch (error) {
            toast.error("Failed to submit payment proof");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Notice */}
                <Card className="bg-indigo-950/30 border-indigo-500/30">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <AlertCircle className="h-8 w-8 text-indigo-400" />
                        <div>
                            <CardTitle className="text-indigo-100 text-lg">Payment Gateway Integration in Process</CardTitle>
                            <CardDescription className="text-indigo-300">
                                Please follow the manual steps below to complete your enrollment. Our team will verify and enroll you within 2-4 hours.
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Step 1: Payment Details */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Badge className="bg-primary hover:bg-primary">Step 1</Badge> Make Payment
                        </h2>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Scan QR Code</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-xl mb-4">
                                    {/* Using a placeholder QR for demo - in prod this would be dynamically generated or static from admin */}
                                    <div className="w-48 h-48 bg-zinc-200 flex items-center justify-center relative">
                                        <QrCode className="h-32 w-32 text-zinc-800" />
                                        <div className="absolute inset-x-0 bottom-0 py-1 bg-zinc-800 text-[10px] text-zinc-100 text-center uppercase font-bold tracking-widest">
                                            Shoraj Learning Platform
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="font-mono text-sm text-zinc-300">UPI ID: shoraj@upi</p>
                                    <p className="text-xs text-zinc-500 mt-1">Accepts all UPI apps (GPay, PhonePe, Paytm)</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Bank Transfer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Account Name</span>
                                    <span className="font-semibold">Shoraj Education Pvt Ltd</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Bank Name</span>
                                    <span className="font-semibold">HDFC Bank</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">A/C Number</span>
                                    <span className="font-mono font-semibold">50200084729103</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">IFSC Code</span>
                                    <span className="font-mono font-semibold">HDFC0001234</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Help */}
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
                            onClick={() => window.open(`https://wa.me/919999999999?text=Hi, I want to pay for ${course.title}`, "_blank")}
                        >
                            <MessageSquare className="h-4 w-4" /> Need Help? WhatsApp Support
                        </Button>
                    </div>

                    {/* Step 2: Upload Proof */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Badge className="bg-primary hover:bg-primary">Step 2</Badge> Upload Proof
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="course">Selected Course</Label>
                                        <div className="p-3 bg-zinc-800 rounded-md border border-zinc-700 flex justify-between items-center">
                                            <span className="font-semibold text-sm">{course.title}</span>
                                            <span className="text-emerald-400 font-bold">₹{course.price}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="txid">Transaction ID / Reference No.</Label>
                                        <Input
                                            id="txid"
                                            placeholder="Enter UTR or Txn ID"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            className="bg-zinc-800 border-zinc-700 focus:ring-primary"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Upload Screenshot (Recommended)</Label>
                                        <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors relative transition-all duration-300">
                                            {proofUrl ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                                    <span className="text-xs text-zinc-400">Screenshot Attached</span>
                                                    <Button type="button" variant="ghost" size="xs" onClick={() => setProofUrl("")} className="text-red-400 h-6">Remove</Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-zinc-500" />
                                                    <span className="text-xs text-zinc-400">Drag or click to upload proof</span>
                                                    <Input
                                                        type="file"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={handleUpload}
                                                        accept="image/*"
                                                        disabled={uploading}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-bold transition-all shadow-lg hover:shadow-primary/20"
                                disabled={submitting || uploading}
                            >
                                {submitting ? <Loader2 className="animate-spin mr-2" /> : "Complete Enrollment"}
                            </Button>

                            <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest font-bold">
                                Secure manual verification platform
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
