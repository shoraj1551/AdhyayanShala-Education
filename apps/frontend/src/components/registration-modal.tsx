"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Phone, Mail } from "lucide-react";

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type: "Workshop" | "Course";
    price?: string;
}

export function RegistrationModal({ isOpen, onClose, title, type, price }: RegistrationModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        institution: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (value: string) => {
        setFormData({ ...formData, role: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Registration Data:", formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            onClose();
            setFormData({ name: "", email: "", phone: "", role: "", institution: "" });
        }, 2500);
    };

    // Mock brochure download
    const handleDownloadBrochure = () => {
        alert("Downloading brochure for " + title);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Register for {title}</DialogTitle>
                    <DialogDescription>
                        Complete the form below to secure your spot.
                        {price && <span className="block mt-2 font-semibold text-primary">Price: {price}</span>}
                    </DialogDescription>
                </DialogHeader>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="flex justify-end">
                            <Button type="button" variant="outline" size="sm" onClick={handleDownloadBrochure} className="text-xs gap-2">
                                <Download className="h-3 w-3" /> Download Brochure
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+91 98765..." />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Current Role</Label>
                            <Select onValueChange={handleRoleChange} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="professional">Working Professional</SelectItem>
                                    <SelectItem value="educator">Educator/Teacher</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="institution">Company / Institution Name</Label>
                            <Input id="institution" name="institution" value={formData.institution} onChange={handleChange} placeholder="University of Delhi / Google" />
                        </div>

                        {/* Contact Info Section */}
                        <div className="bg-muted/30 p-3 rounded-lg mt-2 text-sm text-muted-foreground border border-dashed">
                            <p className="font-semibold mb-1 text-xs uppercase tracking-wide">Have Questions?</p>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    <span>support@adhyayanshala.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    <span>+91 98765 43210</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="submit" className="w-full sm:w-auto">Confirm Registration</Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="py-8 text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-green-900">Registration Successful!</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Thank you for registering. You can download the brochure using the button above for course details.
                            <br />We will contact you shortly.
                        </p>
                        <Button variant="outline" className="mt-6" onClick={onClose}>Close</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
