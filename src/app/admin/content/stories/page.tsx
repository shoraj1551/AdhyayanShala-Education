"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Star
} from "lucide-react"

// Mock data - In real app, this would come from Supabase
const mockStories = [
  {
    id: "1",
    title: "The Digital Nomad's Journey",
    slug: "digital-nomad-journey",
    excerpt: "A tale of remote work and worldwide adventures",
    genre: "Adventure",
    readingTime: 8,
    published: true,
    publishedAt: "2024-01-15T10:00:00Z",
    views: 1247,
    likes: 89,
    wordCount: 2500,
    status: "published"
  },
  {
    id: "2", 
    title: "Code & Coffee",
    slug: "code-and-coffee",
    excerpt: "Late night coding sessions and caffeine-fueled breakthroughs",
    genre: "Technology",
    readingTime: 6,
    published: true,
    publishedAt: "2024-01-12T14:30:00Z",
    views: 892,
    likes: 67,
    wordCount: 1800,
    status: "published"
  },
  {
    id: "3",
    title: "The Startup Dream",
    slug: "startup-dream-draft",
    excerpt: "Building a company from scratch in the modern world",
    genre: "Business",
    readingTime: 12,
    published: false,
    publishedAt: null,
    views: 0,
    likes: 0,
    wordCount: 3200,
    status: "draft"
  },
  {
    id: "4",
    title: "Remote Work Revolution",
    slug: "remote-work-revolution",
    excerpt: "How the pandemic changed the way we work forever",
    genre: "Lifestyle",
    readingTime: 10,
    published: true,
    publishedAt: "2024-01-08T09:15:00Z",
    views: 1567,
    likes: 124,
    wordCount: 2800,
    status: "published"
  },
  {
    id: "5",
    title: "Learning in Public",
    slug: "learning-in-public",
    excerpt: "The power of sharing your learning journey with the world",
    genre: "Education",
    readingTime: 7,
    published: false,
    publishedAt: null,
    views: 0,
    likes: 0,
    wordCount: 2100,
    status: "scheduled"
  }
]

export default function AdminStoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const genres = ["All", "Adventure", "Technology", "Business", "Lifestyle", "Education", "Personal"]
  const statuses = ["All", "published", "draft", "scheduled"]

  const filteredStories = mockStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = selectedGenre === "All" || story.genre === selectedGenre
    const matchesStatus = selectedStatus === "All" || story.status === selectedStatus
    return matchesSearch && matchesGenre && matchesStatus
  })

  const handleStoryAction = (storyId: string, action: string) => {
    console.log(`${action} story:`, storyId)
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
    const variants: Record<string, { color: string }> = {
      published: { color: "bg-green-100 text-green-800" },
      draft: { color: "bg-gray-100 text-gray-800" },
      scheduled: { color: "bg-blue-100 text-blue-800" }
    }
    
    const config = variants[status] || variants.draft
    
    return (
      <Badge className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const totalStories = mockStories.length
  const publishedStories = mockStories.filter(s => s.status === 'published').length
  const draftStories = mockStories.filter(s => s.status === 'draft').length
  const totalViews = mockStories.reduce((sum, s) => sum + s.views, 0)

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Stories Management</h1>
              <p className="mt-2 text-lg text-gray-600">
                Create and manage your story collection
              </p>
            </div>
            <Link href="/admin/content/stories/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Story
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedStories}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((publishedStories / totalStories) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftStories}</div>
              <p className="text-xs text-muted-foreground">
                Unpublished content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all stories
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
                    placeholder="Search stories..."
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
                      Genre: {selectedGenre}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {genres.map((genre) => (
                      <DropdownMenuItem
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                      >
                        {genre}
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

        {/* Stories List */}
        <div className="space-y-4">
          {filteredStories.map((story) => (
            <Card key={story.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{story.title}</h3>
                      {getStatusBadge(story.status)}
                      <Badge variant="outline" className="text-xs">
                        {story.genre}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{story.excerpt}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {story.publishedAt 
                            ? formatDate(story.publishedAt)
                            : "Not published"
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{story.readingTime} min read</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{story.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{story.likes} likes</span>
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
                        onClick={() => handleStoryAction(story.id, 'edit')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Story
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(`/stories/${story.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Story
                      </DropdownMenuItem>
                      {story.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={() => handleStoryAction(story.id, 'publish')}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleStoryAction(story.id, 'duplicate')}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStoryAction(story.id, 'delete')}
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

        {filteredStories.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedGenre !== "All" || selectedStatus !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first story"
                }
              </p>
              {(!searchTerm && selectedGenre === "All" && selectedStatus === "All") && (
                <Link href="/admin/content/stories/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Story
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