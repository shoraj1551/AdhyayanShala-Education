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
import { AlertCircle, CheckCircle, Save, Eye, X, Calendar, Clock, MapPin, Users, DollarSign, Video } from "lucide-react"

export default function NewWorkshopPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    fullDescription: '',
    category: '',
    type: 'Online',
    price: 199.99,
    discountPrice: '',
    duration: 6,
    maxAttendees: 30,
    location: '',
    date: '',
    time: '',
    endTime: '',
    requirements: [] as string[],
    learningOutcomes: [] as string[],
    agenda: [] as string[],
    tags: [] as string[],
    published: false,
    featured: false,
    thumbnail: '',
    meetingLink: ''
  })
  const [currentRequirement, setCurrentRequirement] = useState('')
  const [currentOutcome, setCurrentOutcome] = useState('')
  const [currentAgendaItem, setCurrentAgendaItem] = useState('')
  const [currentTag, setCurrentTag] = useState('')
  
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const categories = [
    "Web Development", "Programming", "React", "Full-Stack", "Backend", "Frontend",
    "Database", "Mobile Development", "DevOps", "Data Science", "Design"
  ]

  const types = ["Online", "In-Person", "Hybrid"]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' || name === 'maxAttendees' ? parseFloat(value) || 0 : value
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

  const handleAddAgendaItem = () => {
    if (currentAgendaItem.trim() && !formData.agenda.includes(currentAgendaItem.trim())) {
      setFormData(prev => ({
        ...prev,
        agenda: [...prev.agenda, currentAgendaItem.trim()]
      }))
      setCurrentAgendaItem('')
    }
  }

  const handleRemoveAgendaItem = (itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter(item => item !== itemToRemove)
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

  const handleKeyPress = (e: React.KeyboardEvent, type: 'requirement' | 'outcome' | 'agenda' | 'tag') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (type === 'requirement') handleAddRequirement()
      else if (type === 'outcome') handleAddOutcome()
      else if (type === 'agenda') handleAddAgendaItem()
      else if (type === 'tag') handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}`)
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`)

      const workshopData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        full_description: formData.fullDescription,
        category: formData.category,
        type: formData.type,
        price: formData.price,
        discount_price: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        duration_hours: formData.duration,
        max_attendees: formData.maxAttendees,
        location: formData.location,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        requirements: formData.requirements,
        learning_outcomes: formData.learningOutcomes,
        agenda: formData.agenda,
        tags: formData.tags,
        published: formData.published,
        featured: formData.featured,
        published_at: formData.published ? new Date().toISOString() : null,
        instructor_id: user.id,
        thumbnail_url: formData.thumbnail || null,
        meeting_link: formData.meetingLink || null
      }

      const { data, error } = await supabase
        .from('workshops')
        .insert([workshopData])
        .select()
        .single()

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Workshop created successfully!' })
        setTimeout(() => {
          router.push('/admin/content/workshops')
        }, 2000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Workshop</h1>
          <p className="mt-2 text-lg text-gray-600">
            Design an interactive learning experience for your audience.
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
                  <CardTitle>Workshop Information</CardTitle>
                  <CardDescription>
                    Basic details about your workshop
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Workshop Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter workshop title"
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
                      URL: /workshops/{formData.slug || 'your-slug-here'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description for workshop cards"
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
                      placeholder="Detailed workshop description, what participants will learn, etc."
                      rows={6}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule & Location</CardTitle>
                  <CardDescription>
                    When and where the workshop will take place
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours) *</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min="1"
                        max="24"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Start Time *</Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder={formData.type === 'Online' ? 'Online via Zoom/Meet' : 'Physical address or venue'}
                      required
                    />
                  </div>

                  {(formData.type === 'Online' || formData.type === 'Hybrid') && (
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink">Meeting Link</Label>
                      <Input
                        id="meetingLink"
                        name="meetingLink"
                        type="url"
                        value={formData.meetingLink}
                        onChange={handleInputChange}
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Details</CardTitle>
                  <CardDescription>
                    Define the workshop structure and learning outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Prerequisites</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentRequirement}
                        onChange={(e) => setCurrentRequirement(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'requirement')}
                        placeholder="Add a prerequisite"
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

                  <div className="space-y-2">
                    <Label>Agenda Items</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentAgendaItem}
                        onChange={(e) => setCurrentAgendaItem(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'agenda')}
                        placeholder="Add an agenda item"
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddAgendaItem} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.agenda.map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveAgendaItem(item)}
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
                        Make this workshop available for registration
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
                      <Label>Featured workshop</Label>
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
                  <CardTitle>Workshop Settings</CardTitle>
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
                    <Label htmlFor="type">Workshop Type</Label>
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
                            <div className="flex items-center gap-2">
                              {type === "In-Person" && <MapPin className="h-4 w-4" />}
                              {type === "Online" && <Video className="h-4 w-4" />}
                              {type === "Hybrid" && <Calendar className="h-4 w-4" />}
                              {type}
                            </div>
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

                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <Input
                      id="maxAttendees"
                      name="maxAttendees"
                      type="number"
                      min="1"
                      value={formData.maxAttendees}
                      onChange={handleInputChange}
                      required
                    />
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
                    {loading ? 'Saving...' : formData.published ? 'Publish Workshop' : 'Save Draft'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`/workshops/${formData.slug}`, '_blank')}
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