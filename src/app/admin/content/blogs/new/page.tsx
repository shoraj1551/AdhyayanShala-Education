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

export default function NewBlogPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [] as string[],
    published: false,
    featuredImage: ''
  })
  const [currentTag, setCurrentTag] = useState('')
  
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const categories = [
    "Education", "Technology", "Storytelling", "Workshops", 
    "Programming", "Personal Development", "Business"
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const blogData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        category_id: null, // You might want to create categories first
        tags: formData.tags,
        published: formData.published,
        published_at: formData.published ? new Date().toISOString() : null,
        author_id: user.id,
        featured_image: formData.featuredImage || null
      }

      const { data, error } = await supabase
        .from('blogs')
        .insert([blogData])
        .select()
        .single()

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Blog post created successfully!' })
        setTimeout(() => {
          router.push('/admin/content/blogs')
        }, 2000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    await handleSubmit(new Event('submit') as any)
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Blog Post</h1>
          <p className="mt-2 text-lg text-gray-600">
            Write and publish a new blog post for your audience.
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
                  <CardTitle>Post Content</CardTitle>
                  <CardDescription>
                    Write your blog post content here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog post title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="url-friendly-slug"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      URL: /blog/{formData.slug || 'your-slug-here'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Brief description of your post"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Write your blog post content here..."
                      rows={15}
                      className="font-mono"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Supports Markdown formatting
                    </p>
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
                        Make this post visible to readers
                      </div>
                    </div>
                    <Switch
                      checked={formData.published}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, published: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Post Settings</CardTitle>
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
                    <Label htmlFor="featuredImage">Featured Image URL</Label>
                    <Input
                      id="featuredImage"
                      name="featuredImage"
                      type="url"
                      value={formData.featuredImage}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : formData.published ? 'Publish' : 'Save Draft'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`/blog/${formData.slug}`, '_blank')}
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