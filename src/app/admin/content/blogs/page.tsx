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
import { 
  FileText, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User
} from "lucide-react"
import Link from "next/link"

// Mock data - In real app, this would come from Supabase
const mockBlogs = [
  {
    id: "1",
    title: "The Future of Education: Embracing Digital Learning",
    excerpt: "Exploring how technology is transforming the way we learn and teach in the modern world.",
    category: "Education",
    tags: ["education", "technology", "digital learning"],
    published: true,
    publishedAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    author: "Shoraj Tomer",
    views: 1247,
    likes: 89,
    comments: 23
  },
  {
    id: "2",
    title: "The Art of Storytelling in Digital Age",
    excerpt: "How traditional storytelling techniques can be adapted for digital platforms and modern audiences.",
    category: "Storytelling",
    tags: ["storytelling", "content creation", "digital"],
    published: true,
    publishedAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-12T15:30:00Z",
    author: "Shoraj Tomer",
    views: 892,
    likes: 67,
    comments: 18
  },
  {
    id: "3",
    title: "Building Effective Online Workshops",
    excerpt: "A comprehensive guide to creating engaging and impactful virtual learning experiences.",
    category: "Workshops",
    tags: ["workshops", "online learning", "education"],
    published: false,
    publishedAt: null,
    updatedAt: "2024-01-05T09:15:00Z",
    author: "Shoraj Tomer",
    views: 0,
    likes: 0,
    comments: 0
  }
]

export default function AdminBlogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "Education", "Storytelling", "Workshops", "Technology"]

  const filteredBlogs = mockBlogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      // In real app, make API call to delete
      console.log("Delete blog:", id)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not published"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Blog Management</h1>
              <p className="mt-2 text-lg text-gray-600">
                Create, edit, and manage your blog posts
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/content/blogs/new">
                <Plus className="h-4 w-4 mr-2" />
                New Blog Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
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
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts List */}
        <div className="space-y-4">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={blog.published ? "default" : "secondary"}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{blog.category}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="text-base mb-3">
                      {blog.excerpt}
                    </CardDescription>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {blog.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(blog.publishedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {blog.views} views
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
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/content/blogs/${blog.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/blog/${blog.id}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {blog.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>💖 {blog.likes} likes</span>
                    <span>💬 {blog.comments} comments</span>
                  </div>
                  <div>
                    Last updated: {formatDate(blog.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "All" 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first blog post"
                }
              </p>
              <Button asChild>
                <Link href="/admin/content/blogs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blog Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminRoute>
  )
}