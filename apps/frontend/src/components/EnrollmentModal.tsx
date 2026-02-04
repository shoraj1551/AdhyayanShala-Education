"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Circle, CreditCard, ChevronRight, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface EnrollmentModalProps {
    course: {
        id: string;
        title: string;
        price: number;
        discountedPrice?: number;
    };
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type PaymentPlanType = 'FULL' | 'INSTALLMENT_2' | 'INSTALLMENT_4';

export function EnrollmentModal({ course, isOpen, onClose, onSuccess }: EnrollmentModalProps) {
    const { user, token } = useAuth();
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
    });

    // Payment Plan Selection
    const [selectedPlan, setSelectedPlan] = useState<PaymentPlanType>('FULL');

    // Sync user data if modal opens/user loads
    useEffect(() => {
        if (isOpen && user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email
            }));
        }
    }, [isOpen, user]);

    // Pricing Calculations
    const basePrice = course.discountedPrice || course.price;
    const isFree = basePrice === 0;

    const plans = [
        {
            id: 'FULL',
            title: "One-Time Payment",
            description: "Best Value - Pay upfront and save extra.",
            discountPercent: 20,
            get total() { return Math.round(basePrice * (1 - this.discountPercent / 100)) },
            get installment() { return this.total },
            installments: 1
        },
        {
            id: 'INSTALLMENT_2',
            title: "2-Part Installment",
            description: "Pay 50% now, 50% next month.",
            discountPercent: 10,
            get total() { return Math.round(basePrice * (1 - this.discountPercent / 100)) },
            get installment() { return Math.round(this.total / 2) },
            installments: 2
        },
        {
            id: 'INSTALLMENT_4',
            title: "Standard Plan (4 Parts)",
            description: "Easy monthly payments. No discount.",
            discountPercent: 0,
            get total() { return basePrice },
            get installment() { return Math.round(this.total / 4) },
            installments: 4
        }
    ];

    const currentPlan = plans.find(p => p.id === selectedPlan)!;

    const handleNext = () => {
        if (!formData.name || !formData.phone) {
            toast.error("Please fill in all required fields.");
            return;
        }
        // Basic phone validation
        if (formData.phone.length < 10) {
            toast.error("Please enter a valid phone number.");
            return;
        }
        setStep(2);
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleEnroll = async () => {
        // If it's free, skip payment logic
        if (isFree) {
            setIsLoading(true);
            try {
                await api.post(`/courses/${course.id}/enroll`, {
                    paymentPlan: 'FREE',
                    billingDetails: formData
                }, token!);
                toast.success("Enrolled successfully!");
                onSuccess();
                onClose();
            } catch (error: any) {
                console.error("Enrollment failed", error);
                toast.error(error.message || "Enrollment failed.");
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Razorpay Flow
        setIsLoading(true);
        try {
            // 1. Create Order
            const orderData = await api.post('/payments/create-order', {
                courseId: course.id,
                plan: selectedPlan
            }, token!);

            // 2. Check for Mock Order (Fallback mechanism)
            if (orderData.id.startsWith('order_mock_')) {
                toast.info("Test Mode: Simulating Payment...", { description: "Using mock provider (No keys found)." });

                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

                const verifyData = {
                    razorpay_order_id: orderData.id,
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_signature: 'mock_signature',
                    courseId: course.id,
                    plan: selectedPlan,
                    billingDetails: formData
                };

                const verifyRes = await api.post('/payments/verify', verifyData, token!);
                if (verifyRes.success) {
                    toast.success("Payment Successful! Welcome aboard.");
                    onSuccess();
                    onClose();
                } else {
                    toast.error("Mock Verification Failed.");
                }
                setIsLoading(false);
                return;
            }

            // 3. Load Razorpay SDK
            const res = await loadRazorpay();
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setIsLoading(false);
                return;
            }

            // 3. Open Razorpay
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Shoraj Learning",
                description: `Enrollment: ${course.title} (${selectedPlan})`,
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            courseId: course.id,
                            plan: selectedPlan,
                            billingDetails: formData
                        };

                        const verifyRes = await api.post('/payments/verify', verifyData, token!);

                        if (verifyRes.success) {
                            toast.success("Payment Successful! Welcome aboard.");
                            onSuccess();
                            onClose();
                        } else {
                            toast.error(verifyRes.message || "Payment Verification Failed.");
                        }
                    } catch (error) {
                        toast.error("Payment Verification Failed.");
                        console.error(error);
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error("Enrollment/Payment failed", error);
            if (error.status === 403 || error.message?.includes("limit")) {
                toast.error("Guest Limit Reached", {
                    description: "You have reached the guest limit. Please sign up to continue."
                });
            } else {
                toast.error(error.message || "Could not initiate payment. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl">
                        {step === 1 ? "Student Details" : "Select Payment Plan"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Please confirm your details for certification and billing."
                            : `Secure enrollment for "${course.title}"`}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4">
                    {step === 1 ? (
                        <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Confirm your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-muted opacity-70"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Mobile Number</Label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                        +91
                                    </span>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setFormData({ ...formData, phone: val });
                                        }}
                                        placeholder="98765 43210"
                                        className="rounded-l-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                            {/* Plan Selection Cards */}
                            <div className="grid gap-3">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id as PaymentPlanType)}
                                        className={`relative flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${selectedPlan === plan.id
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "hover:border-primary/50 hover:bg-muted/50"
                                            }`}
                                    >
                                        <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${selectedPlan === plan.id ? "border-primary" : "border-muted-foreground"
                                            }`}>
                                            {selectedPlan === plan.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">{plan.title}</p>
                                                {plan.discountPercent > 0 && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">
                                                        SAVE {plan.discountPercent}%
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{plan.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₹{plan.installment.toLocaleString()}</p>
                                            {plan.installments > 1 && (
                                                <p className="text-[10px] text-muted-foreground">x {plan.installments} months</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="bg-muted/30 p-3 rounded-lg text-xs space-y-2 mt-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Original Price</span>
                                    <span className="line-through text-muted-foreground">₹{basePrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>Total Payable</span>
                                    <span className="text-primary truncate">
                                        ₹{currentPlan.total.toLocaleString()}
                                        {currentPlan.discountPercent > 0 && ` (Saved ₹${(basePrice - currentPlan.total).toLocaleString()})`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 pt-2 bg-muted/10">
                    {step === 1 ? (
                        <Button onClick={handleNext} className="w-full gap-2">
                            Proceed to Payment Options <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button onClick={handleEnroll} disabled={isLoading} className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                                {isLoading ? "Processing..." : `Pay ₹${currentPlan.installment.toLocaleString()} & Enroll`}
                            </Button>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-muted-foreground">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Secure SSL Payment. 100% Money Back Guarantee.</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
