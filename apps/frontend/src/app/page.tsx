import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
      {/* 1. HERO — LEARNING PHILOSOPHY FIRST */}
      <header className="section-spacing container-narrow text-center">
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-medium leading-tight">
            Learn by understanding, <br />
            <span className="text-muted-foreground">not memorizing.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-prose mx-auto">
            Courses and tests designed to build strong fundamentals in data science, mathematics, and statistics.
          </p>
          <p className="text-sm font-medium tracking-wide uppercase text-muted-foreground pt-4">
            Taught by Shoraj Tomer
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/courses"
              className="bg-foreground text-background px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Start learning
            </Link>
            <Link href="/courses" className="text-foreground border-b border-transparent hover:border-foreground">
              View courses →
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* 2. WHO THIS IS FOR */}
        <section className="section-spacing border-t border-border">
          <div className="container-narrow">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-lg font-medium mb-4">Who this is for</h2>
                <p className="text-muted-foreground mb-4">
                  This platform is for learners who feel: <br />
                  <span className="italic">"I know tools, but my fundamentals are weak."</span>
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>College students (CS / Data / Math)</li>
                  <li>Professionals seeking depth</li>
                  <li>Self-learners valuing first principles</li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-medium mb-4">Who this is NOT for</h2>
                <ul className="space-y-2 list-none text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 opacity-50">✕</span> Quick certificates
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 opacity-50">✕</span> Shortcuts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 opacity-50">✕</span> "Learn X in 7 days"
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TEACHING LOOP */}
        <section className="section-spacing bg-muted/30">
          <div className="container-narrow">
            <h2 className="text-2xl font-medium mb-12 text-center">How learning happens here</h2>
            <div className="space-y-12 relative border-l border-border ml-4 md:ml-0 md:pl-0 md:border-l-0">
              <div className="grid gap-8 md:grid-cols-3 md:gap-4 relative">
                {/* Step 1 */}
                <div className="pl-8 relative md:pl-0 md:text-center md:px-4">
                  <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-foreground md:left-1/2 md:-translate-x-1/2 md:-top-6 md:mb-6"></div>
                  <h3 className="font-medium mb-2">1. Concept</h3>
                  <p className="text-sm text-muted-foreground">Start from first principles. Explain why before how.</p>
                </div>
                {/* Step 2 */}
                <div className="pl-8 relative md:pl-0 md:text-center md:px-4">
                  <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-foreground md:left-1/2 md:-translate-x-1/2 md:-top-6 md:mb-6"></div>
                  <h3 className="font-medium mb-2">2. Practice</h3>
                  <p className="text-sm text-muted-foreground">Worked examples and thoughtful problems.</p>
                </div>
                {/* Step 3 */}
                <div className="pl-8 relative md:pl-0 md:text-center md:px-4">
                  <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-foreground md:left-1/2 md:-translate-x-1/2 md:-top-6 md:mb-6"></div>
                  <h3 className="font-medium mb-2">3. Reflection</h3>
                  <p className="text-sm text-muted-foreground">Tests designed to reveal thinking gaps.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SUBJECT AREAS */}
        <section className="section-spacing container-narrow">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-border rounded-sm hover:bg-muted/30 transition-colors">
              <h3 className="font-medium mb-3">Data Science</h3>
              <p className="text-sm text-muted-foreground mb-4">Math-first. Focus on interpretation and assumptions.</p>
              <Link href="/data-science" className="text-sm font-medium border-b border-border pb-0.5 hover:border-foreground transition-colors">Explore →</Link>
            </div>
            <div className="p-6 border border-border rounded-sm hover:bg-muted/30 transition-colors">
              <h3 className="font-medium mb-3">Mathematics</h3>
              <p className="text-sm text-muted-foreground mb-4">Intuition before formulas. Visual reasoning.</p>
              <Link href="/mathematics" className="text-sm font-medium border-b border-border pb-0.5 hover:border-foreground transition-colors">Explore →</Link>
            </div>
            <div className="p-6 border border-border rounded-sm hover:bg-muted/30 transition-colors">
              <h3 className="font-medium mb-3">Statistics</h3>
              <p className="text-sm text-muted-foreground mb-4">Thinking in distributions and uncertainty.</p>
              <Link href="/statistics" className="text-sm font-medium border-b border-border pb-0.5 hover:border-foreground transition-colors">Explore →</Link>
            </div>
          </div>
        </section>

        {/* 6. ASSESSMENT PHILOSOPHY */}
        <section className="section-spacing bg-muted/30">
          <div className="container-narrow text-center">
            <h2 className="text-xl font-medium mb-4">Assessment Philosophy</h2>
            <p className="text-muted-foreground max-w-prose mx-auto">
              Tests here are designed to reveal how you think — not just what you remember.
              We use conceptual MCQs and numerical problems to expose specific gaps in understanding.
            </p>
          </div>
        </section>

        {/* 7. TEACHER SECTION */}
        <section className="section-spacing container-narrow">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-medium text-muted-foreground">The Instructor</h2>
              <h3 className="text-2xl font-medium">Shoraj Tomer</h3>
              <p className="text-muted-foreground">
                I am a teacher focused on fundamentals, reasoning, and clarity.
                My goal is to help you build intuition for complex topics in Data Science and Mathematics,
                moving beyond surface-level tool usage to deep understanding.
              </p>
              <Link href="/about" className="inline-block text-sm font-medium border-b border-border pb-0.5 hover:border-foreground transition-colors">
                Read teaching philosophy →
              </Link>
            </div>
          </div>
        </section>

        {/* 8. FINAL CTA */}
        <section className="section-spacing border-t border-border text-center">
          <div className="container-narrow space-y-6">
            <h2 className="text-3xl font-medium">Start with fundamentals.</h2>
            <p className="text-xl text-muted-foreground">Build real understanding.</p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="bg-foreground text-background px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity">
                Browse courses
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Shoraj Learning Platform. All rights reserved.
      </footer>
    </div>
  );
}
