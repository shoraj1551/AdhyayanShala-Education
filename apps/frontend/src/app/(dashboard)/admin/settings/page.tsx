"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, ShieldAlert, BadgeCheck, Power } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);

    // Mock State for Settings
    const [settings, setSettings] = useState({
        siteName: "AdhyayanShala",
        supportEmail: "support@adhyavanshala.com",
        maintenanceMode: false,
        allowSignups: true,
        allowInstructorSignups: false,
        paymentTestMode: true,
    });

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Platform settings updated successfully.");
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Platform Administration</h1>
                    <p className="text-muted-foreground mt-1">Configure global settings, feature flags, and system parameters.</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="gap-2">
                    {loading ? <span className="animate-spin">⏳</span> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="features">Features & Access</TabsTrigger>
                    <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
                    <TabsTrigger value="logs" disabled className="opacity-50 cursor-not-allowed">System Logs (Pro)</TabsTrigger>
                </TabsList>

                {/* GENERAL SETTINGS */}
                <TabsContent value="general">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Details</CardTitle>
                                <CardDescription>Basic information displayed across the application.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Platform Name</Label>
                                        <Input
                                            value={settings.siteName}
                                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Support Email</Label>
                                        <Input
                                            value={settings.supportEmail}
                                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 bg-red-50/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-600">
                                    <ShieldAlert className="h-5 w-5" />
                                    Danger Zone
                                </CardTitle>
                                <CardDescription>Critical actions that affect system availability.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-semibold">Maintenance Mode</Label>
                                        <p className="text-xs text-muted-foreground">
                                            If enabled, only Admins can access the site. Users will see a "Under Maintenance" page.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onCheckedChange={(c) => setSettings({ ...settings, maintenanceMode: c })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* FEATURES */}
                <TabsContent value="features">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Flags</CardTitle>
                            <CardDescription>Control access to specific platform features.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Student Registration</Label>
                                    <p className="text-sm text-muted-foreground">Allow new students to sign up via the register page.</p>
                                </div>
                                <Switch
                                    checked={settings.allowSignups}
                                    onCheckedChange={(c) => setSettings({ ...settings, allowSignups: c })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Instructor Registration</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow users to sign up as Instructors directly.
                                        <br /><span className="text-xs text-orange-500 font-medium">Recommended: Keep OFF and manually invite/promote instructors.</span>
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.allowInstructorSignups}
                                    onCheckedChange={(c) => setSettings({ ...settings, allowInstructorSignups: c })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PAYMENT */}
                <TabsContent value="payment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Configuration</CardTitle>
                            <CardDescription>Manage Razorpay keys and payment modes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${settings.paymentTestMode ? 'bg-orange-500' : 'bg-green-500'}`} />
                                        Test Mode (Sandbox)
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {settings.paymentTestMode
                                            ? "Using Test/Mock keys. No real money will be charged."
                                            : "LIVE MODE ACTIVE. Real transactions are enabled."}
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.paymentTestMode}
                                    onCheckedChange={(c) => setSettings({ ...settings, paymentTestMode: c })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Razorpay Key ID</Label>
                                <div className="relative">
                                    <Input value="rzp_test_********************" disabled className="bg-muted" />
                                    <BadgeCheck className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Key is set via server environment variables.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
