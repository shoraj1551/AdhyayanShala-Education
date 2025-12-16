import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, PenTool, GraduationCap, Users, Video, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Welcome to My Digital Space
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Where education meets creativity. Join me on this journey of learning through 
              stories, courses, workshops, and meaningful content.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/blog">Explore Blog</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                <Link href="/about">Learn More About Me</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            What I Offer
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover various ways to learn and grow with me
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-blue-600" />
              <CardTitle>Blog & Articles</CardTitle>
              <CardDescription>
                Thoughtful articles on technology, education, and life lessons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/blog">Read Blog</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <PenTool className="h-10 w-10 text-purple-600" />
              <CardTitle>Stories</CardTitle>
              <CardDescription>
                Creative stories that inspire, entertain, and teach valuable lessons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/stories">Read Stories</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-green-600" />
              <CardTitle>Online Courses</CardTitle>
              <CardDescription>
                Comprehensive courses designed to advance your skills and knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-orange-600" />
              <CardTitle>Workshops</CardTitle>
              <CardDescription>
                Interactive workshops for hands-on learning and skill development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/workshops">Join Workshops</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-red-600" />
              <CardTitle>Online Tests</CardTitle>
              <CardDescription>
                Test your knowledge and track your progress with curated assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/tests">Take Tests</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Video className="h-10 w-10 text-pink-600" />
              <CardTitle>YouTube Channel</CardTitle>
              <CardDescription>
                Educational videos, tutorials, and engaging content for visual learners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/youtube">Watch Videos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to Start Learning?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of learners who are already growing with my content
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/readings">Browse Reading List</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
