"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useEffect, useState } from "react";
import { getContact } from "@/lib/api";

export default function ContactPage() {
    const defaultContactInfo = {
        EMAIL: [
            { id: '1', label: 'General Inquiries', value: 'info@adhyayanshala.com', isPrimary: true },
            { id: '2', label: 'Student Support', value: 'support@adhyayanshala.com', isPrimary: false }
        ],
        PHONE: [
            { id: '1', label: 'Phone Support', value: '+91 98765 43210', description: 'Available Mon-Fri, 9am - 6pm IST', isPrimary: true }
        ],
        OFFICE: [
            { id: '1', label: 'Our Office', value: 'Sector 62, Noida, Uttar Pradesh, India - 201301', description: 'AdhyayanShala Education Pvt Ltd.', isPrimary: true }
        ]
    };
    const [contactInfo, setContactInfo] = useState<any>(defaultContactInfo);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getContact()
            .then(data => {
                if (data && (data.EMAIL || data.PHONE || data.OFFICE)) {
                    setContactInfo(data);
                }
            })
            .catch(err => console.error("Failed to fetch contact info", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>

                <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
                <p className="text-muted-foreground mb-12 text-lg">We&apos;d love to hear from you. Here&apos;s how you can reach us.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-muted-foreground">Loading contact info...</p>
                        ) : (
                            <>
                                {/* Email */}
                                {contactInfo.EMAIL && contactInfo.EMAIL.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Mail className="h-5 w-5 text-primary" /> Email Support
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {contactInfo.EMAIL.map((item: any) => (
                                                <div key={item.id}>
                                                    <p className="font-semibold">{item.label}</p>
                                                    <a href={`mailto:${item.value}`} className="text-primary hover:underline">{item.value}</a>
                                                    {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Phone */}
                                {contactInfo.PHONE && contactInfo.PHONE.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Phone className="h-5 w-5 text-primary" /> Phone Support
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {contactInfo.PHONE.map((item: any) => (
                                                <div key={item.id}>
                                                    {item.description && <p className="text-muted-foreground mb-2">{item.description}</p>}
                                                    <p className="text-lg font-bold">{item.value}</p>
                                                    <p className="text-sm font-semibold mt-1">{item.label}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Office */}
                                {contactInfo.OFFICE && contactInfo.OFFICE.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-primary" /> Our Office
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {contactInfo.OFFICE.map((item: any) => (
                                                <div key={item.id}>
                                                    <p className="text-muted-foreground whitespace-pre-line">
                                                        {item.description ? `${item.description}\n` : ''}
                                                        {item.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>

                    {/* Contact Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Send us a Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget; // Capture form reference
                                const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

                                const formData = new FormData(form);
                                const data = {
                                    name: formData.get('name'),
                                    email: formData.get('email'),
                                    subject: formData.get('subject'),
                                    message: formData.get('message'),
                                };

                                try {
                                    // Basic validation
                                    if (!data.name || !data.email || !data.message) {
                                        alert("Please fill in all required fields.");
                                        return;
                                    }

                                    if (submitBtn) {
                                        submitBtn.disabled = true;
                                        submitBtn.innerText = "Sending...";
                                    }

                                    await import("@/lib/api").then(mod => mod.submitContactInquiry(data));
                                    alert("Message sent successfully!");
                                    form.reset();
                                } catch (error) {
                                    console.error("Failed to send message", error);
                                    alert("Failed to send message. Please try again.");
                                } finally {
                                    if (submitBtn) {
                                        submitBtn.disabled = false;
                                        submitBtn.innerText = "Send Message";
                                    }
                                }
                            }}>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input id="name" name="name" placeholder="Your name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input id="email" name="email" type="email" placeholder="Your email address" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" name="subject" placeholder="What is this regarding?" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message *</Label>
                                    <Textarea id="message" name="message" placeholder="Type your message here..." className="min-h-[120px]" required />
                                </div>
                                <Button type="submit" className="w-full">Send Message</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
