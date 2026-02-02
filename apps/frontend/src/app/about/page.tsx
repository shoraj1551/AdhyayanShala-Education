"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Target, Lightbulb, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>

                {/* Hero Section */}
                <div className="space-y-4 text-center md:text-left">
                    <h1 className="text-4xl font-bold tracking-tight">About AdhyayanShala</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl">
                        Empowering lifelong learners through structured paths, hands-on practice, and a community-driven approach to education.
                    </p>
                </div>

                {/* Mission */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Our Mission</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                            We believe that education should be accessible, practical, and transformative. Our mission is to provide
                            high-quality learning experiences that bridge the gap between theory and real-world application.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Whether you're starting your journey in a new field or advancing your expertise, we're here to guide you
                            with carefully crafted courses, assessments, and learning paths.
                        </p>
                    </CardContent>
                </Card>

                {/* Philosophy */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Lightbulb className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Learning Philosophy</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Learn by Doing</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We emphasize hands-on practice and real-world application. Every course includes interactive
                                exercises, projects, and assessments designed to reinforce your learning through active engagement.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Build in Public</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Learning is most effective when shared. We encourage students to document their progress, share
                                their work, and learn from each other's experiences. Your journey inspires others.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Structured Yet Flexible</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Our learning paths provide clear direction while allowing you to learn at your own pace. Progress
                                through modules sequentially or jump to topics that interest you most.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructor Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Meet the Team</CardTitle>
                        </div>
                        <CardDescription>
                            Passionate educators dedicated to your success
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl">ST</AvatarFallback>
                            </Avatar>
                            <div className="space-y-3 flex-1">
                                <div>
                                    <h3 className="text-xl font-semibold">Shoraj Tomer</h3>
                                    <p className="text-sm text-muted-foreground">Founder & Lead Instructor</p>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    With years of experience in education and technology, Shoraj is passionate about creating
                                    learning experiences that are both rigorous and accessible. His teaching philosophy centers
                                    on practical application, continuous improvement, and fostering a growth mindset.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Statistics</span>
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Data Science</span>
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Web Development</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Values */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Our Values</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <h3 className="font-semibold">Quality Over Quantity</h3>
                                <p className="text-sm text-muted-foreground">
                                    We focus on creating deeply valuable content rather than overwhelming you with options.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold">Continuous Improvement</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our courses evolve based on student feedback and industry changes.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold">Community First</h3>
                                <p className="text-sm text-muted-foreground">
                                    Learning is a collaborative journey. We foster a supportive environment for all students.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold">Accessibility</h3>
                                <p className="text-sm text-muted-foreground">
                                    Education should be available to everyone, regardless of background or location.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
