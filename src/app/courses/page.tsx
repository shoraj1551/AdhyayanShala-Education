import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star, Play, BookOpen, Award } from "lucide-react"

// Mock data - In real app, this would come from Supabase
const courses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    description: "Master modern web development with React, Node.js, and databases. Build real-world projects and deploy them to production.",
    shortDescription: "Learn full-stack web development from scratch",
    price: 99.99,
    originalPrice: 199.99,
    duration: 40,
    level: "Beginner",
    thumbnail: "/api/placeholder/400/225",
    previewVideo: "https://example.com/preview",
    enrollmentCount: 1250,
    rating: 4.8,
    ratingCount: 324,
    modules: 12,
    projects: 8,
    certificate: true,
    requirements: [
      "Basic computer skills",
      "No programming experience required",
      "Willingness to learn and practice"
    ],
    whatYouLearn: [
      "HTML5, CSS3, and responsive design",
      "JavaScript ES6+ and DOM manipulation",
      "React.js and modern frontend development",
      "Node.js and Express.js for backend",
      "Database design and integration",
      "Deployment and production best practices"
    ],
    instructor: "Shoraj Tomer",
    featured: true
  },
  {
    id: "2",
    title: "Advanced JavaScript Mastery",
    description: "Deep dive into advanced JavaScript concepts, design patterns, and modern ES6+ features.",
    shortDescription: "Master advanced JavaScript concepts and patterns",
    price: 79.99,
    originalPrice: 149.99,
    duration: 25,
    level: "Advanced",
    thumbnail: "/api/placeholder/400/225",
    enrollmentCount: 890,
    rating: 4.9,
    ratingCount: 186,
    modules: 8,
    projects: 5,
    certificate: true,
    requirements: [
      "Solid understanding of JavaScript basics",
      "Experience with DOM manipulation",
      "Familiarity with ES6 syntax"
    ],
    whatYouLearn: [
      "Closures, prototypes, and inheritance",
      "Asynchronous JavaScript and Promises",
      "Modern ES6+ features and syntax",
      "JavaScript design patterns",
      "Performance optimization techniques",
      "Testing and debugging strategies"
    ],
    instructor: "Shoraj Tomer",
    featured: false
  },
  {
    id: "3",
    title: "Digital Storytelling for Content Creators",
    description: "Learn the art of storytelling in the digital age. Create compelling content that engages and converts.",
    shortDescription: "Master the art of digital storytelling",
    price: 59.99,
    originalPrice: 99.99,
    duration: 15,
    level: "Beginner",
    thumbnail: "/api/placeholder/400/225",
    enrollmentCount: 567,
    rating: 4.7,
    ratingCount: 98,
    modules: 6,
    projects: 4,
    certificate: true,
    requirements: [
      "Interest in content creation",
      "Basic writing skills",
      "Creative mindset"
    ],
    whatYouLearn: [
      "Storytelling fundamentals and structure",
      "Digital content strategy",
      "Audience engagement techniques",
      "Visual storytelling with multimedia",
      "Brand storytelling for business",
      "Content distribution and promotion"
    ],
    instructor: "Shoraj Tomer",
    featured: false
  },
  {
    id: "4",
    title: "Effective Workshop Design & Facilitation",
    description: "Design and facilitate engaging workshops that deliver real value to participants.",
    shortDescription: "Create impactful learning experiences",
    price: 89.99,
    originalPrice: 159.99,
    duration: 20,
    level: "Intermediate",
    thumbnail: "/api/placeholder/400/225",
    enrollmentCount: 432,
    rating: 4.6,
    ratingCount: 67,
    modules: 7,
    projects: 3,
    certificate: true,
    requirements: [
      "Experience in teaching or training",
      "Basic presentation skills",
      "Desire to help others learn"
    ],
    whatYouLearn: [
      "Workshop planning and structure",
      "Adult learning principles",
      "Facilitation techniques and tools",
      "Engagement and interaction strategies",
      "Virtual workshop best practices",
      "Measuring workshop success"
    ],
    instructor: "Shoraj Tomer",
    featured: false
  }
]

const levels = ["All", "Beginner", "Intermediate", "Advanced"]

export default function Courses() {
  const featuredCourses = courses.filter(course => course.featured)
  const regularCourses = courses.filter(course => !course.featured)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Online Courses
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Comprehensive courses designed to advance your skills and knowledge
        </p>
      </div>

      {/* Level Filter */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-2 justify-center">
          {levels.map((level) => (
            <Button
              key={level}
              variant={level === "All" ? "default" : "outline"}
              className="mb-2"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Course
          </h2>
          {featuredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden mb-8">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="lg" className="rounded-full w-16 h-16">
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{course.level}</Badge>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Featured
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration} hours
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.enrollmentCount} students
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                      {course.rating} ({course.ratingCount})
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.modules} modules
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">${course.price}</span>
                      <span className="text-lg text-gray-500 line-through">${course.originalPrice}</span>
                      <Badge variant="destructive">50% OFF</Badge>
                    </div>
                    {course.certificate && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Award className="w-4 h-4" />
                        Certificate included
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button asChild className="flex-1">
                      <Link href={`/courses/${course.id}`}>View Details</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/courses/${course.id}?enroll=true`}>Enroll Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}

      {/* All Courses */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          All Courses
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="aspect-video bg-gradient-to-r from-indigo-500 to-blue-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="rounded-full">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{course.level}</Badge>
                  {course.certificate && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Award className="w-3 h-3" />
                      Certificate
                    </div>
                  )}
                </div>
                <CardTitle className="line-clamp-2">
                  <Link href={`/courses/${course.id}`} className="hover:text-blue-600 transition-colors">
                    {course.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.shortDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}h
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.enrollmentCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    {course.rating}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">${course.price}</span>
                    <span className="text-sm text-gray-500 line-through">${course.originalPrice}</span>
                  </div>
                </div>

                <Button variant="outline" asChild className="w-full">
                  <Link href={`/courses/${course.id}`}>View Course</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Load More */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg">
          Load More Courses
        </Button>
      </div>
    </div>
  )
}