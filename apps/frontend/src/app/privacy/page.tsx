"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>

                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

                <Card>
                    <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-sm text-muted-foreground mb-6">Last Updated: February 01, 2026</p>

                        <h3>1. Introduction</h3>
                        <p>
                            At AdhyayanShala ("we", "our", or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                        </p>

                        <h3>2. Information We Collect</h3>
                        <p>
                            We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
                        </p>
                        <ul>
                            <li><strong>Personal Data:</strong> Name, email address, phone number, and other contact data.</li>
                            <li><strong>Credentials:</strong> Passwords, password hints, and similar security information used for authentication and account access.</li>
                            <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases.</li>
                        </ul>

                        <h3>3. How We Use Your Information</h3>
                        <p>
                            We use the information we collect or receive:
                        </p>
                        <ul>
                            <li>To facilitate account creation and logon process.</li>
                            <li>To send you marketing and promotional communications.</li>
                            <li>To fulfill and manage your orders.</li>
                            <li>To request feedback and contact you about your use of our website.</li>
                        </ul>

                        <h3>4. Disclosure of Your Information</h3>
                        <p>
                            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                        </p>
                        <ul>
                            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                        </ul>

                        <h3>5. Security of Your Information</h3>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>

                        <h3>6. Contact Us</h3>
                        <p>
                            If you have questions or comments about this policy, you may email us at <a href="mailto:privacy@adhyayanshala.com" className="text-primary hover:underline">privacy@adhyayanshala.com</a>.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
