import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Trophy, Brain, CheckCircle, Star } from "lucide-react"

// Mock data - In real app, this would come from Supabase
const tests = [
  {
    id: "1",
    title: "JavaScript Fundamentals Assessment",
    description: "Comprehensive test covering JavaScript basics, ES6+ features, DOM manipulation, and asynchronous programming.",
    category: "Programming",
    questionCount: 50,
    duration: 60,
    price: 29.99,
    passingScore: 70,
    maxAttempts: 3,
    difficulty: "Beginner",
    attemptsCount: 1247,
    averageScore: 73,
    tags: ["JavaScript", "ES6", "DOM", "Programming"],
    sampleQuestions: [
      "What is the difference between let, const, and var?",
      "Explain closure in JavaScript with an example.",
      "How does asynchronous programming work in JavaScript?"
    ],
    featured: true
  },
  {
    id: "2",
    title: "React.js Advanced Concepts",
    description: "Test your knowledge of advanced React concepts including hooks, context, performance optimization, and testing.",
    category: "Frontend Development",
    questionCount: 40,
    duration: 45,
    price: 39.99,
    passingScore: 75,
    maxAttempts: 2,
    difficulty: "Advanced",
    attemptsCount: 856,
    averageScore: 68,
    tags: ["React", "Hooks", "Context", "Testing"],
    sampleQuestions: [
      "When would you use useMemo vs useCallback?",
      "Explain the concept of lifting state up in React.",
      "What are the benefits of using React.memo?"
    ],
    featured: false
  },
  {
    id: "3",
    title: "Web Development Best Practices",
    description: "Assess your knowledge of web development standards, accessibility, performance optimization, and security.",
    category: "Web Development",
    questionCount: 35,
    duration: 40,
    price: 24.99,
    passingScore: 70,
    maxAttempts: 3,
    difficulty: "Intermediate",
    attemptsCount: 623,
    averageScore: 76,
    tags: ["Best Practices", "Accessibility", "Performance", "Security"],
    sampleQuestions: [
      "What are the key principles of accessible web design?",
      "How can you optimize website loading performance?",
      "Explain HTTPS and why it's important for web security."
    ],
    featured: false
  },
  {
    id: "4",
    title: "Content Strategy & Storytelling",
    description: "Evaluate your understanding of content strategy, storytelling techniques, and audience engagement methods.",
    category: "Content Creation",
    questionCount: 30,
    duration: 35,
    price: 19.99,
    passingScore: 65,
    maxAttempts: 3,
    difficulty: "Beginner",
    attemptsCount: 445,
    averageScore: 71,
    tags: ["Content Strategy", "Storytelling", "Marketing"],
    sampleQuestions: [
      "What are the key elements of a compelling story?",
      "How do you identify your target audience?",
      "What makes content engaging and shareable?"
    ],
    featured: false
  },
  {
    id: "5",
    title: "Database Design & SQL Mastery",
    description: "Test your skills in database design principles, SQL queries, normalization, and performance optimization.",
    category: "Database",
    questionCount: 45,
    duration: 50,
    price: 34.99,
    passingScore: 75,
    maxAttempts: 2,
    difficulty: "Intermediate",
    attemptsCount: 389,
    averageScore: 69,
    tags: ["SQL", "Database Design", "Normalization"],
    sampleQuestions: [
      "Explain the different types of SQL JOINs.",
      "What is database normalization and why is it important?",
      "How do you optimize slow SQL queries?"
    ],
    featured: false
  }
]

const categories = ["All", "Programming", "Frontend Development", "Web Development", "Content Creation", "Database"]
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "text-green-600 bg-green-50 border-green-200"
    case "intermediate":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "advanced":
      return "text-red-600 bg-red-50 border-red-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

export default function Tests() {
  const featuredTests = tests.filter(test => test.featured)
  const regularTests = tests.filter(test => !test.featured)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Online Tests & Assessments
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Test your knowledge and track your progress with curated assessments
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-12 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Difficulty</h3>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={difficulty === "All" ? "default" : "outline"}
                size="sm"
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Test */}
      {featuredTests.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Test
          </h2>
          {featuredTests.map((test) => (
            <Card key={test.id} className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Featured Assessment</p>
                  </div>
                </div>
                <div className="md:w-2/3 p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{test.category}</Badge>
                    <Badge className={getDifficultyColor(test.difficulty)}>
                      {test.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Featured
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {test.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{test.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Brain className="w-4 h-4" />
                      <span>{test.questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{test.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{test.attemptsCount} taken</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Trophy className="w-4 h-4" />
                      <span>{test.averageScore}% avg score</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Sample Questions:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {test.sampleQuestions.slice(0, 2).map((question, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-2xl font-bold text-green-600">
                      ${test.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      {test.maxAttempts} attempts • {test.passingScore}% to pass
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button asChild className="flex-1">
                      <Link href={`/tests/${test.id}`}>View Details</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/tests/${test.id}/purchase`}>Take Test</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}

      {/* All Tests */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          All Tests & Assessments
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{test.category}</Badge>
                  <Badge className={getDifficultyColor(test.difficulty)}>
                    {test.difficulty}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">
                  <Link href={`/tests/${test.id}`} className="hover:text-blue-600 transition-colors">
                    {test.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {test.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    {test.questionCount} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {test.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {test.attemptsCount} taken
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {test.averageScore}% avg
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {test.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {test.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{test.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-green-600">
                    ${test.price}
                  </div>
                  <div className="text-xs text-gray-500">
                    {test.passingScore}% to pass
                  </div>
                </div>

                <Button variant="outline" asChild className="w-full">
                  <Link href={`/tests/${test.id}`}>View Test</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Performance Stats */}
      <section className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Test Performance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {tests.reduce((sum, test) => sum + test.attemptsCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round(tests.reduce((sum, test) => sum + test.averageScore, 0) / tests.length)}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {tests.length}
            </div>
            <div className="text-sm text-gray-600">Available Tests</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {categories.length - 1}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </section>
    </div>
  )
}