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
  FileText, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Clock,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react"

// Mock data - In real app, this would come from Supabase
const mockTests = [
  {
    id: "1",
    title: "JavaScript Fundamentals Assessment",
    slug: "javascript-fundamentals-assessment",
    description: "Test your understanding of core JavaScript concepts",
    category: "JavaScript",
    difficulty: "Beginner",
    questionsCount: 25,
    timeLimit: 60,
    passingScore: 70,
    attempts: 156,
    averageScore: 78.5,
    published: true,
    status: "published",
    featured: true,
    createdAt: "2024-01-15T10:00:00Z",
    type: "assessment"
  },
  {
    id: "2", 
    title: "React Components Quiz",
    slug: "react-components-quiz",
    description: "Evaluate your knowledge of React component patterns",
    category: "React",
    difficulty: "Intermediate",
    questionsCount: 20,
    timeLimit: 45,
    passingScore: 75,
    attempts: 89,
    averageScore: 82.3,
    published: true,
    status: "published",
    featured: false,
    createdAt: "2024-01-12T14:30:00Z",
    type: "quiz"
  },
  {
    id: "3",
    title: "Advanced TypeScript Challenge",
    slug: "advanced-typescript-challenge-draft",
    description: "Advanced TypeScript concepts and real-world scenarios",
    category: "TypeScript",
    difficulty: "Advanced",
    questionsCount: 30,
    timeLimit: 90,
    passingScore: 80,
    attempts: 0,
    averageScore: 0,
    published: false,
    status: "draft",
    featured: false,
    createdAt: "2024-01-10T09:15:00Z",
    type: "challenge"
  },
  {
    id: "4",
    title: "Web Development Certification Exam",
    slug: "web-development-certification",
    description: "Comprehensive exam covering full-stack web development",
    category: "Web Development",
    difficulty: "Intermediate",
    questionsCount: 50,
    timeLimit: 120,
    passingScore: 75,
    attempts: 234,
    averageScore: 76.8,
    published: true,
    status: "published",
    featured: true,
    createdAt: "2024-01-08T09:15:00Z",
    type: "certification"
  },
  {
    id: "5",
    title: "Node.js Backend Assessment",
    slug: "nodejs-backend-assessment",
    description: "Test your backend development skills with Node.js",
    category: "Backend",
    difficulty: "Intermediate",
    questionsCount: 35,
    timeLimit: 75,
    passingScore: 70,
    attempts: 67,
    averageScore: 73.2,
    published: false,
    status: "scheduled",
    featured: false,
    createdAt: "2024-01-05T11:30:00Z",
    type: "assessment"
  }
]

export default function AdminTestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedType, setSelectedType] = useState("All")

  const categories = ["All", "JavaScript", "React", "TypeScript", "Web Development", "Backend", "Frontend", "Database"]
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]
  const statuses = ["All", "published", "draft", "scheduled"]
  const types = ["All", "quiz", "assessment", "challenge", "certification"]

  const filteredTests = mockTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || test.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All" || test.difficulty === selectedDifficulty
    const matchesStatus = selectedStatus === "All" || test.status === selectedStatus
    const matchesType = selectedType === "All" || test.type === selectedType
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus && matchesType
  })

  const handleTestAction = (testId: string, action: string) => {
    console.log(`${action} test:`, testId)
    // In real app, make API call to perform action
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  const getDifficultyBadge = (difficulty: string) => {
    const variants: Record<string, any> = {
      Beginner: { color: "bg-green-100 text-green-800" },
      Intermediate: { color: "bg-yellow-100 text-yellow-800" },
      Advanced: { color: "bg-red-100 text-red-800" }
    }
    
    const config = variants[difficulty] || variants.Beginner
    
    return (
      <Badge className={config.color}>
        {difficulty}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      quiz: { color: "bg-blue-100 text-blue-800", icon: FileText },
      assessment: { color: "bg-purple-100 text-purple-800", icon: Target },
      challenge: { color: "bg-orange-100 text-orange-800", icon: TrendingUp },
      certification: { color: "bg-pink-100 text-pink-800", icon: CheckCircle }
    }
    
    const config = variants[type] || variants.quiz
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const totalTests = mockTests.length
  const publishedTests = mockTests.filter(t => t.status === 'published').length
  const draftTests = mockTests.filter(t => t.status === 'draft').length
  const totalAttempts = mockTests.reduce((sum, t) => sum + t.attempts, 0)
  const averageScore = mockTests.filter(t => t.attempts > 0).reduce((sum, t, _, arr) => 
    sum + t.averageScore / arr.length, 0) || 0

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tests Management</h1>
              <p className="mt-2 text-lg text-gray-600">
                Create and manage assessment tests and quizzes
              </p>
            </div>
            <Link href="/admin/content/tests/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Test
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedTests}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((publishedTests / totalTests) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttempts}</div>
              <p className="text-xs text-muted-foreground">
                Test submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Across all tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftTests}</div>
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
                    placeholder="Search tests..."
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
                      Type: {selectedType}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {types.map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setSelectedType(type)}
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Difficulty: {selectedDifficulty}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {difficulties.map((difficulty) => (
                      <DropdownMenuItem
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty)}
                      >
                        {difficulty}
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

        {/* Tests List */}
        <div className="space-y-4">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{test.title}</h3>
                      {getStatusBadge(test.status)}
                      {getTypeBadge(test.type)}
                      {getDifficultyBadge(test.difficulty)}
                      <Badge variant="outline" className="text-xs">
                        {test.category}
                      </Badge>
                      {test.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{test.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{test.questionsCount} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{test.timeLimit} minutes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{test.passingScore}% to pass</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{test.attempts} attempts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className={test.averageScore > 0 ? "text-green-600 font-medium" : "text-gray-400"}>
                          {test.averageScore > 0 ? `${test.averageScore.toFixed(1)}% avg` : 'No data'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{formatDate(test.createdAt)}</span>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    {test.attempts > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Average Performance</span>
                          <span className={test.averageScore >= test.passingScore ? "text-green-600" : "text-red-600"}>
                            {test.averageScore >= test.passingScore ? "Above passing" : "Below passing"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              test.averageScore >= test.passingScore ? 'bg-green-600' : 'bg-red-600'
                            }`}
                            style={{ 
                              width: `${Math.min(test.averageScore, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleTestAction(test.id, 'edit')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Test
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(`/tests/${test.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Test
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTestAction(test.id, 'questions')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Manage Questions
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTestAction(test.id, 'results')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Results
                      </DropdownMenuItem>
                      {test.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={() => handleTestAction(test.id, 'publish')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleTestAction(test.id, 'duplicate')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTestAction(test.id, 'analytics')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTestAction(test.id, 'delete')}
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

        {filteredTests.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "All" || selectedDifficulty !== "All" || selectedStatus !== "All" || selectedType !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first test"
                }
              </p>
              {(!searchTerm && selectedCategory === "All" && selectedDifficulty === "All" && selectedStatus === "All" && selectedType === "All") && (
                <Link href="/admin/content/tests/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Test
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