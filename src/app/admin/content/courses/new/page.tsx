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
import { AlertCircle, CheckCircle, Save, Eye, X } from "lucide-react"

export default function NewCoursePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    fullDescription: '',
    category: '',
    level: 'Beginner',
    price: 99.99,
    discountPrice: '',
    duration: 10,
    lessonsCount: 8,
    requirements: [] as string[],
    learningOutcomes: [] as string[],
    tags: [] as string[],
    published: false,
    featured: false,
    thumbnail: '',
    introVideo: ''
  })
  const [currentRequirement, setCurrentRequirement] = useState('')
  const [currentOutcome, setCurrentOutcome] = useState('')
  const [currentTag, setCurrentTag] = useState('')
  
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const categories = [
    "Web Development", "Programming", "React", "Backend", "Frontend",
    "Database", "Mobile Development", "DevOps", "Data Science", "AI/ML"
  ]

  const levels = ["Beginner", "Intermediate", "Advanced"]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' || name === 'lessonsCount' ? parseFloat(value) || 0 : value
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

  const handleAddRequirement = () => {
    if (currentRequirement.trim() && !formData.requirements.includes(currentRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }))
      setCurrentRequirement('')
    }
  }

  const handleRemoveRequirement = (reqToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }))
  }

  const handleAddOutcome = () => {
    if (currentOutcome.trim() && !formData.learningOutcomes.includes(currentOutcome.trim())) {
      setFormData(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, currentOutcome.trim()]
      }))
      setCurrentOutcome('')
    }
  }

  const handleRemoveOutcome = (outcomeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter(outcome => outcome !== outcomeToRemove)
    }))
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

  const handleKeyPress = (e: React.KeyboardEvent, type: 'requirement' | 'outcome' | 'tag') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (type === 'requirement') handleAddRequirement()
      else if (type === 'outcome') handleAddOutcome()
      else if (type === 'tag') handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const courseData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        full_description: formData.fullDescription,
        category: formData.category,
        level: formData.level,
        price: formData.price,
        discount_price: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        duration_hours: formData.duration,
        lessons_count: formData.lessonsCount,
        requirements: formData.requirements,
        learning_outcomes: formData.learningOutcomes,
        tags: formData.tags,
        published: formData.published,
        featured: formData.featured,
        published_at: formData.published ? new Date().toISOString() : null,
        instructor_id: user.id,
        thumbnail_url: formData.thumbnail || null,
        intro_video_url: formData.introVideo || null
      }

      const { error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single()

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Course created successfully!' })
        setTimeout(() => {
          router.push('/admin/content/courses')
        }, 2000)
      }
    } catch (err) {
      console.error('Course creation error:', err)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Course</h1>
          <p className="mt-2 text-lg text-gray-600">
            Design and create a comprehensive learning experience for your students.
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
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>
                    Basic details about your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter course title"
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
                      URL: /courses/{formData.slug || 'your-slug-here'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description for course cards"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullDescription">Full Description *</Label>
                    <Textarea
                      id="fullDescription"
                      name="fullDescription"
                      value={formData.fullDescription}
                      onChange={handleInputChange}
                      placeholder="Detailed course description, curriculum overview, etc."
                      rows={8}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Details</CardTitle>
                  <CardDescription>
                    Define what students will learn and need
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Requirements</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentRequirement}
                        onChange={(e) => setCurrentRequirement(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'requirement')}
                        placeholder="Add a requirement"
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddRequirement} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(req)}
                            className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Learning Outcomes</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentOutcome}
                        onChange={(e) => setCurrentOutcome(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'outcome')}
                        placeholder="Add a learning outcome"
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddOutcome} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.learningOutcomes.map((outcome, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {outcome}
                          <button
                            type="button"
                            onClick={() => handleRemoveOutcome(outcome)}
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
                        Make this course available for enrollment
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
                      <Label>Featured course</Label>
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
                  <CardTitle>Course Settings</CardTitle>
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

                  <div className="space-y-2">
                    <Label htmlFor="level">Difficulty Level</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) =>
                        setFormData(prev => ({ ...prev, level: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPrice">Sale Price ($)</Label>
                      <Input
                        id="discountPrice"
                        name="discountPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discountPrice}
                        onChange={handleInputChange}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lessonsCount">Lessons Count</Label>
                      <Input
                        id="lessonsCount"
                        name="lessonsCount"
                        type="number"
                        min="1"
                        value={formData.lessonsCount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      name="thumbnail"
                      type="url"
                      value={formData.thumbnail}
                      onChange={handleInputChange}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="introVideo">Intro Video URL</Label>
                    <Input
                      id="introVideo"
                      name="introVideo"
                      type="url"
                      value={formData.introVideo}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'tag')}
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : formData.published ? 'Publish Course' : 'Save Draft'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`/courses/${formData.slug}`, '_blank')}
                    disabled={!formData.slug}
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