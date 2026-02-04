"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Trophy, Users, Globe, Zap, CheckCircle2, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import React, { useRef, useState } from "react";
import { AuthSelectionModal } from "@/components/auth-selection-modal";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { newsData } from "@/lib/news-data";
import { NewsTicker } from "@/components/NewsTicker";

export default function LandingPage() {
  const { user, isLoading, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Fetch News
  React.useEffect(() => {
    // Dynamically import api to avoid SSR issues if any, or just call it
    // Assuming api is client-side safe
    import("@/lib/api").then(({ api }) => {
      // Try /courses/announcements 
      api.get("/courses/announcements").then(data => {
        if (Array.isArray(data)) setAnnouncements(data);
      }).catch(err => console.error("Failed to fetch news", err));
    });
  }, []);

  // Cleanup legacy service workers from previous projects that might block assets
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          console.log('Unregistering legacy service worker:', registration);
          registration.unregister();
        }
      });
    }
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };



  return (
    <div ref={targetRef} className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <div className="fixed top-16 left-0 right-0 z-40">
        <NewsTicker />
      </div>
      {/* Navbar (Simplified for Landing) */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <img src="/logo.png" alt="AdhyayanShala" className="h-8 w-8 object-contain" />
          <span>AdhyayanShala</span>
        </div>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-24 h-9 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link href="/explore">
                <Button variant="outline">Browse Courses</Button>
              </Link>
              <Button variant="ghost" onClick={() => logout(false)}>Log Out</Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsAuthModalOpen(true)}>Sign In</Button>
              <Link href="/explore">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex h-[90vh] items-center justify-center pt-16 overflow-hidden">
        {/* Abstract Background */}
        {/* Hero Background Image */}
        {/* Hero Background Image */}
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Deep space background" className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60" />
        </div>

        {/* Floating Elements Animation */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
          />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container relative z-10 flex flex-col items-center text-center px-4 text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-2xl">
              Master the <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Future</span> <br /> of Learning
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 max-w-2xl text-lg md:text-xl text-zinc-200 drop-shadow-md font-medium"
          >
            Unlock your potential with expert-led courses in AI, Engineering, and Design.
            Stay ahead of the curve with our adaptive learning platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/explore">
              <Button
                size="lg"
                className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
              >
                Browse Courses <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {!user && (
              null
            )}
          </motion.div>
        </motion.div>
      </section>

      <AuthSelectionModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* News & Events Section */}
      <section className="py-24 bg-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Latest News & Events</h2>
            <p className="mt-4 text-muted-foreground text-lg">Stay updated with our upcoming workshops and announcements.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {announcements.length > 0 ? announcements.map((news: any, i) => (
              <Card key={i} className="bg-card border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{news.type}</span>
                    <span className="text-xs text-muted-foreground">{new Date(news.createdAt).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{news.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{news.content}</p>
                  <Button variant="link" className="p-0 mt-4 h-auto font-semibold">Read More &rarr;</Button>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-3 text-center text-muted-foreground">No recent announcements.</div>
            )}
            {/* Fallback to static data if empty for demo purposes? Or maybe just show nothing */}
          </div>
        </div>
      </section>

      {/* Our Story / Mission */}
      <section className="py-24 bg-secondary/5 relative">
        <div className="container px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.h2 variants={fadeIn} className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Our Story & Mission
              </motion.h2>
              <motion.p variants={fadeIn} className="mt-4 text-muted-foreground text-lg leading-relaxed">
                AdhyayanShala was founded on a simple belief: <strong>Quality education should be accessible to everyone, everywhere.</strong>
                <br /><br />
                In a rapidly evolving digital world, traditional learning methods often fall behind.
                We built this platform to bridge the gap between theoretical knowledge and practical application.
                Whether you're a student looking to upskill or an instructor passionate about teaching,
                AdhyayanShala provides the tools you need to succeed.
              </motion.p>
              <motion.div variants={fadeIn} className="mt-8 flex gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-bold text-primary">10k+</h3>
                  <p className="text-sm text-muted-foreground">Active Learners</p>
                </div>
                <div className="w-px h-16 bg-border mx-4" />
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-bold text-primary">50+</h3>
                  <p className="text-sm text-muted-foreground">Expert Courses</p>
                </div>
                <div className="w-px h-16 bg-border mx-4" />
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-bold text-primary">98%</h3>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
              </motion.div>
            </div>
            <motion.div variants={fadeIn} className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
              <img src="/mission.png" alt="Innovation in Education" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose AdhyayanShala?</h2>
            <p className="mt-4 text-muted-foreground text-lg">Everything you need to accelerate your learning journey.</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { title: "Expert Instructors", icon: Trophy, desc: "Learn from industry professionals who have conquered the challenges you face." },
              { title: "Interactive Learning", icon: Brain, desc: "Engage with quizzes, coding challenges, and real-time feedback." },
              { title: "Community Driven", icon: Users, desc: "Join a global network of learners. Share knowledge and grow together." },
              { title: "Learn Anywhere", icon: Globe, desc: "Access your courses on any device, anytime. Seamless mobile experience." },
              { title: "Fast-Track Career", icon: Zap, desc: "Curriculum designed to get you job-ready for the most in-demand roles.", isComingSoon: true },
              { title: "Certified Success", icon: CheckCircle2, desc: "Earn verified certificates to showcase your achievements to employers.", isComingSoon: true },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-card p-6 shadow-md transition-all hover:shadow-xl",
                  feature.isComingSoon ? "border-dashed border-amber-500/50 bg-amber-500/5" : "hover:border-primary/50"
                )}
              >
                {feature.isComingSoon && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">
                    Coming Soon
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className={cn(
                    "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                    feature.isComingSoon ? "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  )}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* Footer */}
      <footer className="border-t py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-2xl text-primary mb-4">
                <img src="/logo.png" alt="AdhyayanShala" className="h-8 w-8 object-contain" />
                <span>AdhyayanShala</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                Empowering learners worldwide directly from industry experts.
                Join the revolution in digital education today.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/explore" className="hover:text-primary transition-colors">All Courses</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/instructor/register" className="hover:text-primary transition-colors">Become an Instructor</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="bg-primary/10 p-2 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="bg-primary/10 p-2 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-primary/10 p-2 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="bg-primary/10 p-2 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} AdhyayanShala Education. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

