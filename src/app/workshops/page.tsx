import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, MapPin, Video, CheckCircle, AlertCircle } from "lucide-react"

// Mock data - In real app, this would come from Supabase
const workshops = [
  {
    id: "1",
    title: "Modern Web Development Workshop",
    description: "Hands-on workshop covering React, Next.js, and modern development practices. Build a complete application from scratch.",
    shortDescription: "Learn React and Next.js with hands-on practice",
    startDate: "2024-02-15T10:00:00Z",
    endDate: "2024-02-15T17:00:00Z",
    duration: 7,
    price: 149.99,
    capacity: 25,
    enrolledCount: 18,
    location: "Online",
    isOnline: true,
    meetingLink: "https://zoom.us/example",
    thumbnail: "/api/placeholder/400/225",
    requirements: [
      "Basic HTML/CSS knowledge",
      "JavaScript fundamentals",
      "Laptop with internet connection"
    ],
    whatYouLearn: [
      "React components and hooks",
      "Next.js app router and routing",
      "State management with Context API",
      "API integration and data fetching",
      "Deployment to Vercel"
    ],
    instructor: "Shoraj Tomer",
    status: "upcoming",
    featured: true
  },
  {
    id: "2",
    title: "Content Creation Masterclass",
    description: "Learn to create engaging content for blogs, social media, and video platforms. Understand your audience and build your personal brand.",
    shortDescription: "Master content creation across all platforms",
    startDate: "2024-02-22T14:00:00Z",
    endDate: "2024-02-22T18:00:00Z",
    duration: 4,
    price: 89.99,
    capacity: 30,
    enrolledCount: 22,
    location: "Online",
    isOnline: true,
    requirements: [
      "Interest in content creation",
      "Basic writing skills",
      "Social media familiarity"
    ],
    whatYouLearn: [
      "Content strategy development",
      "Writing for different platforms",
      "Visual content creation",
      "Audience engagement techniques",
      "Brand building and consistency"
    ],
    instructor: "Shoraj Tomer",
    status: "upcoming"
  },
  {
    id: "3",
    title: "Effective Workshop Facilitation",
    description: "Learn to design and facilitate impactful workshops. Perfect for educators, trainers, and team leads.",
    shortDescription: "Design and facilitate engaging workshops",
    startDate: "2024-03-05T09:00:00Z",
    endDate: "2024-03-05T16:00:00Z",
    duration: 7,
    price: 179.99,
    capacity: 20,
    enrolledCount: 12,
    location: "Conference Center, Downtown",
    isOnline: false,
    requirements: [
      "Experience in teaching/training",
      "Presentation skills",
      "Willingness to practice facilitation"
    ],
    whatYouLearn: [
      "Workshop design principles",
      "Facilitation techniques",
      "Managing group dynamics",
      "Interactive learning methods",
      "Feedback and evaluation"
    ],
    instructor: "Shoraj Tomer",
    status: "upcoming"
  },
  {
    id: "4",
    title: "JavaScript Deep Dive",
    description: "Advanced JavaScript workshop covering closures, prototypes, async programming, and modern ES6+ features.",
    startDate: "2024-01-20T10:00:00Z",
    endDate: "2024-01-20T16:00:00Z",
    duration: 6,
    price: 129.99,
    capacity: 30,
    enrolledCount: 30,
    location: "Online",
    isOnline: true,
    instructor: "Shoraj Tomer",
    status: "completed"
  },
  {
    id: "5",
    title: "Storytelling for Business",
    description: "Learn to use storytelling techniques to enhance your business communication and marketing efforts.",
    startDate: "2024-01-10T13:00:00Z",
    endDate: "2024-01-10T17:00:00Z",
    duration: 4,
    price: 99.99,
    capacity: 25,
    enrolledCount: 23,
    location: "Online",
    isOnline: true,
    instructor: "Shoraj Tomer",
    status: "completed"
  }
]

const getStatusBadge = (status: string, enrolledCount: number, capacity: number) => {
  if (status === "completed") {
    return <Badge variant="outline" className="text-gray-600 border-gray-300">Completed</Badge>
  }
  if (enrolledCount >= capacity) {
    return <Badge variant="destructive">Sold Out</Badge>
  }
  if (status === "upcoming") {
    return <Badge variant="default">Open for Registration</Badge>
  }
  return <Badge variant="secondary">Unknown</Badge>
}

const getAvailabilityStatus = (enrolledCount: number, capacity: number) => {
  const spotsLeft = capacity - enrolledCount
  if (spotsLeft === 0) {
    return { text: "Sold Out", color: "text-red-600", icon: AlertCircle }
  }
  if (spotsLeft <= 5) {
    return { text: `Only ${spotsLeft} spots left`, color: "text-orange-600", icon: AlertCircle }
  }
  return { text: `${spotsLeft} spots available`, color: "text-green-600", icon: CheckCircle }
}

export default function Workshops() {
  const upcomingWorkshops = workshops.filter(w => w.status === "upcoming")
  const completedWorkshops = workshops.filter(w => w.status === "completed")
  const featuredWorkshop = upcomingWorkshops.find(w => w.featured)
  const regularWorkshops = upcomingWorkshops.filter(w => !w.featured)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Workshops & Events
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Interactive workshops for hands-on learning and skill development
        </p>
      </div>

      {/* Featured Workshop */}
      {featuredWorkshop && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            ⭐ Featured Workshop
          </h2>
          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 bg-gradient-to-r from-green-500 to-blue-600"></div>
              <div className="md:w-2/3 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  {getStatusBadge(featuredWorkshop.status, featuredWorkshop.enrolledCount, featuredWorkshop.capacity)}
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Featured
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {featuredWorkshop.title}
                </h3>
                <p className="text-gray-600 mb-4">{featuredWorkshop.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredWorkshop.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(featuredWorkshop.startDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {new Date(featuredWorkshop.endDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} ({featuredWorkshop.duration}h)
                  </div>
                  <div className="flex items-center gap-2">
                    {featuredWorkshop.isOnline ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    {featuredWorkshop.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {featuredWorkshop.enrolledCount}/{featuredWorkshop.capacity} enrolled
                  </div>
                </div>

                {(() => {
                  const availability = getAvailabilityStatus(featuredWorkshop.enrolledCount, featuredWorkshop.capacity)
                  return (
                    <div className={`flex items-center gap-2 mb-6 ${availability.color}`}>
                      <availability.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{availability.text}</span>
                    </div>
                  )
                })()}

                <div className="flex items-center justify-between mb-6">
                  <div className="text-2xl font-bold text-green-600">
                    ${featuredWorkshop.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    Instructor: {featuredWorkshop.instructor}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <Link href={`/workshops/${featuredWorkshop.id}`}>View Details</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    asChild
                    disabled={featuredWorkshop.enrolledCount >= featuredWorkshop.capacity}
                  >
                    <Link href={`/workshops/${featuredWorkshop.id}/register`}>
                      {featuredWorkshop.enrolledCount >= featuredWorkshop.capacity ? "Sold Out" : "Register Now"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Upcoming Workshops */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          Upcoming Workshops
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularWorkshops.map((workshop) => {
            const availability = getAvailabilityStatus(workshop.enrolledCount, workshop.capacity)
            return (
              <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    {getStatusBadge(workshop.status, workshop.enrolledCount, workshop.capacity)}
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      {workshop.isOnline ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {workshop.isOnline ? "Online" : "In-Person"}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/workshops/${workshop.id}`} className="hover:text-blue-600 transition-colors">
                      {workshop.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {workshop.shortDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(workshop.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {workshop.duration} hours
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {workshop.enrolledCount}/{workshop.capacity} enrolled
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 mb-4 ${availability.color}`}>
                    <availability.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{availability.text}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-green-600">
                      ${workshop.price}
                    </div>
                  </div>

                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/workshops/${workshop.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Past Workshops */}
      {completedWorkshops.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            📚 Past Workshops
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {completedWorkshops.map((workshop) => (
              <Card key={workshop.id} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardHeader>
                  <Badge variant="outline" className="text-gray-600 border-gray-300 w-fit mb-2">
                    Completed
                  </Badge>
                  <CardTitle className="text-lg line-clamp-2">
                    {workshop.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {new Date(workshop.startDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-3">
                    {workshop.enrolledCount} participants
                  </div>
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href={`/workshops/${workshop.id}`}>View Summary</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}