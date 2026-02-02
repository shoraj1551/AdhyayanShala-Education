"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming generic style if not present
import { ArrowLeft, Clock, Download, FileText, Mail, Phone, UploadCloud } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function InstructorRegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        currentRole: "",
        experienceYears: "",
        expertise: "",
        topicsToTeach: "",
        bio: "",
        linkedin: "",
        resume: null as File | null
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, resume: e.target.files[0] });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Instructor Application:", formData);
        setSubmitted(true);
    };

    const handleDownloadPolicy = () => {
        alert("Downloading Privacy Policy for Instructors...");
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/5">
                <Card className="max-w-md w-full text-center p-6 shadow-lg border-green-200 bg-green-50/50">
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-800">Application Submitted!</h2>
                    <p className="text-muted-foreground mt-2 mb-6">
                        Thank you for your interest in teaching at AdhyayanShala. Our team will review your extensive profile and contact you regarding the next steps within 2-3 business days.
                    </p>
                    <Link href="/">
                        <Button variant="outline">Return to Home</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>

                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold">Become an Instructor</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Join our global community of experts. Shape the future learners.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Instructor Application Form</CardTitle>
                                <CardDescription>Please provide comprehensive professional details to help us evaluate your profile.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Personal Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Personal Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Jane" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="jane.doe@example.com" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+91 ..." />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Professional Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Professional Profile</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentRole">Current Role/Title</Label>
                                                <Input id="currentRole" name="currentRole" value={formData.currentRole} onChange={handleChange} required placeholder="Senior Data Scientist" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="experienceYears">Years of Experience</Label>
                                                <Select onValueChange={(val) => handleSelectChange('experienceYears', val)} required>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select experience" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0-2">0-2 Years</SelectItem>
                                                        <SelectItem value="3-5">3-5 Years</SelectItem>
                                                        <SelectItem value="5-10">5-10 Years</SelectItem>
                                                        <SelectItem value="10+">10+ Years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expertise">Primary Area of Expertise</Label>
                                            <Input id="expertise" name="expertise" value={formData.expertise} onChange={handleChange} required placeholder="e.g. Artificial Intelligence, Cloud Computing" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="topicsToTeach">What topics do you want to teach?</Label>
                                            <Textarea
                                                id="topicsToTeach"
                                                name="topicsToTeach"
                                                value={formData.topicsToTeach}
                                                onChange={handleChange}
                                                placeholder="List specific topics or courses you intend to cover..."
                                                className="min-h-[80px]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin">LinkedIn Profile / Portfolio</Label>
                                            <Input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Professional Bio</Label>
                                            <Textarea
                                                id="bio"
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                className="min-h-[120px]"
                                                placeholder="Write a brief bio highlighting your teaching philosophy and professional achievements..."
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Uploads */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Documents</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="resume">Resume / CV (PDF or Word)</Label>
                                            <div className="border-2 border-dashed rounded-lg p-6 bg-muted/30 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                                <Input
                                                    id="resume"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-sm text-foreground font-medium">
                                                        {formData.resume ? formData.resume.name : "Click to upload or drag and drop"}
                                                    </span>
                                                    {!formData.resume && <span className="text-xs text-muted-foreground">PDF, DOC up to 5MB</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full text-lg h-12" size="lg">Submit Instructor Application</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Help Card */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" /> Need Help?
                                </CardTitle>
                                <CardDescription>Contact our support team if you have any questions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="bg-background p-2 rounded-full shadow-sm">
                                        <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold">Email Us</p>
                                        <a href="mailto:support@adhyayanshala.com" className="text-muted-foreground hover:text-primary truncate block">instructor-support@adhyayanshala.com</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="bg-background p-2 rounded-full shadow-sm">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Call Us</p>
                                        <p className="text-muted-foreground">+91 98765 43210</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Privacy Policy */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-5 w-5" /> Privacy & Terms
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    We value your privacy. Read about how we handle your data and our terms for instructors.
                                </p>
                                <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleDownloadPolicy}>
                                    <Download className="h-4 w-4" /> Download Privacy Policy
                                </Button>
                            </CardContent>
                            <CardFooter className="bg-muted/30 py-4">
                                <p className="text-xs text-muted-foreground text-center w-full">By submitting, you agree to our Terms of Service.</p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
