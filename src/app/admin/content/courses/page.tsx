"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdminRoute from "@/components/auth/admin-route"
import Link from "next/link"
import { 
  BookOpen, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Calendar,
  Star,
  Users,
  DollarSign,
  Clock,
  PlayCircle
} from "lucide-react"

// Mock data - In real app, this would come from Supabase
const mockCourses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    slug: "web-development-bootcamp",
    description: "Master modern web development with React, Node.js, and databases",
    category: "Web Development",
    level: "Beginner",
    price: 129.99,
    discountPrice: 99.99,
    duration: 40,
    lessonsCount: 25,
    enrollments: 156,
    rating: 4.8,
    reviews: 45,
    published: true,
    publishedAt: "2024-01-15T10:00:00Z",
    status: "published",
    featured: true,
    thumbnail: "https://example.com/course1.jpg",
    difficulty: "beginner"
  },
  {
    id: "2", 
    title: "Advanced JavaScript Mastery",
    slug: "advanced-javascript-mastery",
    description: "Deep dive into advanced JavaScript concepts and patterns",
    category: "Programming",
    level: "Advanced",
    price: 199.99,
    discountPrice: null,
    duration: 60,
    lessonsCount: 35,
    enrollments: 89,
    rating: 4.9,
    reviews: 28,
    published: true,
    publishedAt: "2024-01-12T14:30:00Z",
    status: "published",
    featured: false,
    thumbnail: "https://example.com/course2.jpg",
    difficulty: "advanced"
  },
  {
    id: "3",
    title: "React Hooks and Context",
    slug: "react-hooks-context-draft",
    description: "Master modern React patterns with hooks and context API",
    category: "React",
    level: "Intermediate",
    price: 89.99,
    discountPrice: null,
    duration: 25,
    lessonsCount: 18,
    enrollments: 0,
    rating: 0,
    reviews: 0,
    published: false,
    publishedAt: null,
    status: "draft",
    featured: false,
    thumbnail: null,
    difficulty: "intermediate"
  },
  {
    id: "4",
    title: "Node.js Backend Development",
    slug: "nodejs-backend-development",
    description: "Build scalable backend applications with Node.js and Express",
    category: "Backend",
    level: "Intermediate",
    price: 149.99,
    discountPrice: 119.99,
    duration: 35,
    lessonsCount: 22,
    enrollments: 67,
    rating: 4.7,
    reviews: 18,
    published: true,
    publishedAt: "2024-01-08T09:15:00Z",
    status: "published",
    featured: true,
    thumbnail: "https://example.com/course4.jpg",
    difficulty: "intermediate"
  },
  {
    id: "5",
    title: "Database Design Fundamentals",
    slug: "database-design-fundamentals",
    description: "Learn database design principles and SQL optimization",
    category: "Database",
    level: "Beginner",
    price: 79.99,
    discountPrice: null,
    duration: 20,
    lessonsCount: 15,
    enrollments: 34,
    rating: 4.6,
    reviews: 12,
    published: false,
    publishedAt: null,
    status: "scheduled",
    featured: false,
    thumbnail: "https://example.com/course5.jpg",
    difficulty: "beginner"
  }
]

export default function AdminCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("All")

  const categories = ["All", "Web Development", "Programming", "React", "Backend", "Database", "Mobile", "DevOps"]
  const statuses = ["All", "published", "draft", "scheduled"]
  const levels = ["All", "Beginner", "Intermediate", "Advanced"]

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory
    const matchesStatus = selectedStatus === "All" || course.status === selectedStatus
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesStatus && matchesLevel
  })

  const handleCourseAction = (courseId: string, action: string) => {
    console.log(`${action} course:`, courseId)
    // In real app, make API call to perform action
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      published: { variant: "default", color: "bg-green-100 text-green-800" },
      draft: { variant: "secondary", color: "bg-gray-100 text-gray-800" },
      scheduled: { variant: "default", color: "bg-blue-100 text-blue-800" }
    }
    
    const config = variants[status] || variants.draft
    
    return (
      <Badge className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      Beginner: { color: "bg-green-100 text-green-800" },
      Intermediate: { color: "bg-yellow-100 text-yellow-800" },
      Advanced: { color: "bg-red-100 text-red-800" }
    }
    
    const config = variants[level] || variants.Beginner
    
    return (
      <Badge className={config.color}>
        {level}
      </Badge>
    )
  }

  const totalCourses = mockCourses.length
  const publishedCourses = mockCourses.filter(c => c.status === 'published').length
  const draftCourses = mockCourses.filter(c => c.status === 'draft').length
  const totalEnrollments = mockCourses.reduce((sum, c) => sum + c.enrollments, 0)
  const totalRevenue = mockCourses.reduce((sum, c) => sum + (c.enrollments * (c.discountPrice || c.price)), 0)

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Courses Management</h1>
              <p className="mt-2 text-lg text-gray-600">
                Create and manage your course offerings
              </p>
            </div>
            <Link href="/admin/content/courses/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedCourses}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((publishedCourses / totalCourses) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                Total students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Total earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftCourses}</div>
              <p className="text-xs text-muted-foreground">
                In development
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Category: {selectedCategory}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Level: {selectedLevel}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {levels.map((level) => (
                      <DropdownMenuItem
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                      >
                        {level}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Status: {selectedStatus}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {statuses.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses List */}
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      {getStatusBadge(course.status)}
                      {getLevelBadge(course.level)}
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                      {course.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium text-green-600">
                          {course.discountPrice ? (
                            <>
                              <span className="line-through text-gray-400 mr-1">
                                {formatCurrency(course.price)}
                              </span>
                              {formatCurrency(course.discountPrice)}
                            </>
                          ) : (
                            formatCurrency(course.price)
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{course.duration}h total</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" />
                        <span>{course.lessonsCount} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{course.enrollments} enrolled</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{course.rating > 0 ? `${course.rating} (${course.reviews})` : 'No ratings'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {course.publishedAt 
                            ? formatDate(course.publishedAt)
                            : "Not published"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleCourseAction(course.id, 'edit')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(`/courses/${course.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Course
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCourseAction(course.id, 'students')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Students
                      </DropdownMenuItem>
                      {course.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={() => handleCourseAction(course.id, 'publish')}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleCourseAction(course.id, 'duplicate')}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCourseAction(course.id, 'analytics')}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCourseAction(course.id, 'delete')}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "All" || selectedStatus !== "All" || selectedLevel !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first course"
                }
              </p>
              {(!searchTerm && selectedCategory === "All" && selectedStatus === "All" && selectedLevel === "All") && (
                <Link href="/admin/content/courses/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Course
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminRoute>
  )
}