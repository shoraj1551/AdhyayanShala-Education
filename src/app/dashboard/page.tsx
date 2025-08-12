import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/auth/protected-route"
import { BookOpen, GraduationCap, Users, FileText, Calendar, TrendingUp, Clock, Award } from "lucide-react"
import Link from "next/link"

// Mock data - In real app, this would come from Supabase based on user's enrollments
const mockUserData = {
  enrolledCourses: [
    {
      id: "1",
      title: "Complete Web Development Bootcamp",
      progress: 65,
      nextLesson: "Building APIs with Node.js",
      totalLessons: 48,
      completedLessons: 31,
      estimatedCompletion: "2 weeks"
    },
    {
      id: "2",
      title: "Advanced JavaScript Mastery",
      progress: 30,
      nextLesson: "Async/Await and Promises",
      totalLessons: 32,
      completedLessons: 9,
      estimatedCompletion: "1 month"
    }
  ],
  registeredWorkshops: [
    {
      id: "1",
      title: "Modern Web Development Workshop",
      date: "2024-02-15T10:00:00Z",
      status: "upcoming",
      location: "Online"
    },
    {
      id: "2",
      title: "Content Creation Masterclass",
      date: "2024-02-22T14:00:00Z",
      status: "upcoming",
      location: "Online"
    }
  ],
  testResults: [
    {
      id: "1",
      testTitle: "JavaScript Fundamentals Assessment",
      score: 87,
      passed: true,
      completedAt: "2024-01-20T10:00:00Z",
      attempts: 1,
      maxAttempts: 3
    },
    {
      id: "2",
      testTitle: "React.js Advanced Concepts",
      score: 92,
      passed: true,
      completedAt: "2024-01-18T15:30:00Z",
      attempts: 1,
      maxAttempts: 2
    }
  ],
  stats: {
    totalCoursesEnrolled: 2,
    totalWorkshopsAttended: 3,
    totalTestsPassed: 2,
    averageTestScore: 89.5,
    totalLearningHours: 127,
    certificatesEarned: 1
  }
}

export default function Dashboard() {
  const { enrolledCourses, registeredWorkshops, testResults, stats } = mockUserData

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome back! Here's your learning progress and upcoming activities.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCoursesEnrolled}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalLearningHours} hours of content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workshops Attended</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkshopsAttended}</div>
              <p className="text-xs text-muted-foreground">
                Interactive learning sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Passed</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTestsPassed}</div>
              <p className="text-xs text-muted-foreground">
                {stats.averageTestScore}% average score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.certificatesEarned}</div>
              <p className="text-xs text-muted-foreground">
                Achievements unlocked
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enrolled Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                My Courses
              </CardTitle>
              <CardDescription>
                Continue your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{course.title}</h3>
                    <Badge variant="secondary">{course.progress}%</Badge>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Next: {course.nextLesson}</p>
                    <p>{course.completedLessons}/{course.totalLessons} lessons completed</p>
                    <p className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {course.estimatedCompletion} remaining
                    </p>
                  </div>
                  
                  <Button size="sm" asChild className="w-full">
                    <Link href={`/courses/${course.id}/learn`}>Continue Learning</Link>
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/courses">Browse More Courses</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Workshops */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Upcoming Workshops
              </CardTitle>
              <CardDescription>
                Your registered events and sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {registeredWorkshops.map((workshop) => (
                <div key={workshop.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{workshop.title}</h3>
                    <Badge 
                      variant={workshop.status === 'upcoming' ? 'default' : 'secondary'}
                    >
                      {workshop.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(workshop.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p>Location: {workshop.location}</p>
                  </div>
                  
                  <Button size="sm" variant="outline" asChild className="w-full">
                    <Link href={`/workshops/${workshop.id}`}>View Details</Link>
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/workshops">Browse Workshops</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Recent Test Results
            </CardTitle>
            <CardDescription>
              Your assessment performance and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{result.testTitle}</h3>
                    <Badge 
                      variant={result.passed ? "default" : "destructive"}
                      className={result.passed ? "bg-green-100 text-green-800" : ""}
                    >
                      {result.score}%
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Status: {result.passed ? "Passed ✓" : "Failed"}</p>
                    <p>Attempt: {result.attempts}/{result.maxAttempts}</p>
                    <p>Completed: {new Date(result.completedAt).toLocaleDateString()}</p>
                  </div>
                  
                  <Button size="sm" variant="outline" asChild className="w-full">
                    <Link href={`/tests/${result.id}/results`}>View Details</Link>
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full">
                <Link href="/tests">Take More Tests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and helpful links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/profile">
                  <Users className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/certificates">
                  <Award className="h-4 w-4 mr-2" />
                  Certificates
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/purchases">
                  <FileText className="h-4 w-4 mr-2" />
                  Purchase History
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/settings">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}