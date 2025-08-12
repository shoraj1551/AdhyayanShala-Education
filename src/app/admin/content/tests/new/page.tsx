"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AdminRoute from "@/components/auth/admin-route"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import { AlertCircle, CheckCircle, Save, Eye, X, FileText, Clock, Target, Users, TrendingUp, Plus, Minus } from "lucide-react"

interface Question {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer: string | number
  explanation?: string
  points: number
}

export default function NewTestPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    instructions: '',
    category: '',
    difficulty: 'Beginner',
    type: 'quiz',
    timeLimit: 60,
    passingScore: 70,
    maxAttempts: 3,
    showResults: true,
    shuffleQuestions: false,
    tags: [] as string[],
    published: false,
    featured: false
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentTag, setCurrentTag] = useState('')
  
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const categories = [
    "JavaScript", "React", "TypeScript", "Web Development", "Backend", "Frontend",
    "Database", "Mobile Development", "DevOps", "Data Science", "General Programming"
  ]

  const difficulties = ["Beginner", "Intermediate", "Advanced"]
  const types = ["quiz", "assessment", "challenge", "certification"]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'timeLimit' || name === 'passingScore' || name === 'maxAttempts' ? parseInt(value) || 0 : value
    }))
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setFormData(prev => ({
        ...prev,
        slug
      }))
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId))
  }

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? {
        ...q,
        options: q.options?.map((opt, idx) => idx === optionIndex ? value : opt)
      } : q
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (questions.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one question' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const testData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        instructions: formData.instructions,
        category: formData.category,
        difficulty: formData.difficulty,
        type: formData.type,
        time_limit_minutes: formData.timeLimit,
        passing_score: formData.passingScore,
        max_attempts: formData.maxAttempts,
        show_results_immediately: formData.showResults,
        shuffle_questions: formData.shuffleQuestions,
        questions: questions,
        tags: formData.tags,
        published: formData.published,
        featured: formData.featured,
        published_at: formData.published ? new Date().toISOString() : null,
        creator_id: user.id
      }

      const { data, error } = await supabase
        .from('tests')
        .insert([testData])
        .select()
        .single()

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Test created successfully!' })
        setTimeout(() => {
          router.push('/admin/content/tests')
        }, 2000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  return (
    <AdminRoute>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Test</h1>
          <p className="mt-2 text-lg text-gray-600">
            Create assessments, quizzes, and certification exams.
          </p>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-md mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Information</CardTitle>
                  <CardDescription>
                    Basic details about your test
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Test Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter test title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="url-friendly-slug"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      URL: /tests/{formData.slug || 'your-slug-here'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the test"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      placeholder="Detailed instructions for test takers"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Questions Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Questions ({questions.length})</CardTitle>
                      <CardDescription>
                        Add and manage test questions {totalPoints > 0 && `• Total: ${totalPoints} points`}
                      </CardDescription>
                    </div>
                    <Button type="button" onClick={addQuestion} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Question Type</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value: any) => updateQuestion(question.id, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="short-answer">Short Answer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Points</Label>
                          <Input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Question Text *</Label>
                        <Textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                          placeholder="Enter your question"
                          rows={2}
                          required
                        />
                      </div>

                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2">
                          <Label>Answer Options</Label>
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                              />
                              <Input
                                value={option}
                                onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'true-false' && (
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`tf-${question.id}`}
                                checked={question.correctAnswer === 'true'}
                                onChange={() => updateQuestion(question.id, 'correctAnswer', 'true')}
                              />
                              True
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`tf-${question.id}`}
                                checked={question.correctAnswer === 'false'}
                                onChange={() => updateQuestion(question.id, 'correctAnswer', 'false')}
                              />
                              False
                            </label>
                          </div>
                        </div>
                      )}

                      {question.type === 'short-answer' && (
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <Input
                            value={question.correctAnswer as string}
                            onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                            placeholder="Enter the correct answer"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Explanation (Optional)</Label>
                        <Textarea
                          value={question.explanation || ''}
                          onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                          placeholder="Explain the correct answer"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="mb-4">No questions added yet</p>
                      <Button type="button" onClick={addQuestion}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Question
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Publish immediately</Label>
                      <div className="text-sm text-gray-500">
                        Make this test available to users
                      </div>
                    </div>
                    <Switch
                      checked={formData.published}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, published: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Featured test</Label>
                      <div className="text-sm text-gray-500">
                        Highlight on homepage
                      </div>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, featured: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) =>
                          setFormData(prev => ({ ...prev, difficulty: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      name="timeLimit"
                      type="number"
                      min="1"
                      max="300"
                      value={formData.timeLimit}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        name="passingScore"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.passingScore}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAttempts">Max Attempts</Label>
                      <Input
                        id="maxAttempts"
                        name="maxAttempts"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.maxAttempts}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show results immediately</Label>
                      <div className="text-sm text-gray-500">
                        Display score after completion
                      </div>
                    </div>
                    <Switch
                      checked={formData.showResults}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, showResults: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Shuffle questions</Label>
                      <div className="text-sm text-gray-500">
                        Randomize question order
                      </div>
                    </div>
                    <Switch
                      checked={formData.shuffleQuestions}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, shuffleQuestions: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a tag"
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading || questions.length === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : formData.published ? 'Publish Test' : 'Save Draft'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`/tests/${formData.slug}`, '_blank')}
                    disabled={!formData.slug || questions.length === 0}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminRoute>
  )
}