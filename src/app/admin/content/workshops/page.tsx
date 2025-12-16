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
  Calendar, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Video
} from "lucide-react"

// Mock data - In real app, this would come from Supabase
const mockWorkshops = [
  {
    id: "1",
    title: "Modern Web Development Workshop",
    slug: "modern-web-development-workshop",
    description: "Hands-on workshop covering React, TypeScript, and modern development practices",
    category: "Web Development",
    type: "In-Person",
    price: 299.99,
    discountPrice: 249.99,
    duration: 8,
    maxAttendees: 20,
    currentAttendees: 15,
    location: "San Francisco, CA",
    date: "2024-02-15T09:00:00Z",
    endDate: "2024-02-15T17:00:00Z",
    published: true,
    status: "scheduled",
    featured: true,
    thumbnail: "https://example.com/workshop1.jpg",
    instructor: "Shoraj Tomer"
  },
  {
    id: "2", 
    title: "Advanced JavaScript Patterns",
    slug: "advanced-javascript-patterns",
    description: "Deep dive into advanced JavaScript concepts and design patterns",
    category: "Programming",
    type: "Online",
    price: 199.99,
    discountPrice: null,
    duration: 6,
    maxAttendees: 50,
    currentAttendees: 32,
    location: "Online via Zoom",
    date: "2024-02-20T14:00:00Z",
    endDate: "2024-02-20T20:00:00Z",
    published: true,
    status: "scheduled",
    featured: false,
    thumbnail: "https://example.com/workshop2.jpg",
    instructor: "Shoraj Tomer"
  },
  {
    id: "3",
    title: "React State Management Masterclass",
    slug: "react-state-management-draft",
    description: "Master React state management with hooks, context, and external libraries",
    category: "React",
    type: "Online",
    price: 149.99,
    discountPrice: null,
    duration: 4,
    maxAttendees: 30,
    currentAttendees: 0,
    location: "Online via Zoom",
    date: "2024-03-01T10:00:00Z",
    endDate: "2024-03-01T14:00:00Z",
    published: false,
    status: "draft",
    featured: false,
    thumbnail: null,
    instructor: "Shoraj Tomer"
  },
  {
    id: "4",
    title: "Full-Stack Development Bootcamp",
    slug: "fullstack-development-bootcamp",
    description: "Complete full-stack development workshop with MERN stack",
    category: "Full-Stack",
    type: "Hybrid",
    price: 499.99,
    discountPrice: 399.99,
    duration: 16,
    maxAttendees: 25,
    currentAttendees: 18,
    location: "New York, NY + Online",
    date: "2024-02-25T09:00:00Z",
    endDate: "2024-02-26T17:00:00Z",
    published: true,
    status: "scheduled",
    featured: true,
    thumbnail: "https://example.com/workshop4.jpg",
    instructor: "Shoraj Tomer"
  },
  {
    id: "5",
    title: "Database Design Workshop",
    slug: "database-design-workshop-completed",
    description: "Learn database design principles and optimization techniques",
    category: "Database",
    type: "In-Person",
    price: 199.99,
    discountPrice: null,
    duration: 6,
    maxAttendees: 15,
    currentAttendees: 12,
    location: "Austin, TX",
    date: "2024-01-20T09:00:00Z",
    endDate: "2024-01-20T15:00:00Z",
    published: true,
    status: "completed",
    featured: false,
    thumbnail: "https://example.com/workshop5.jpg",
    instructor: "Shoraj Tomer"
  }
]

export default function AdminWorkshopsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const categories = ["All", "Web Development", "Programming", "React", "Full-Stack", "Database", "Mobile", "DevOps"]
  const types = ["All", "In-Person", "Online", "Hybrid"]
  const statuses = ["All", "scheduled", "draft", "completed", "cancelled"]

  const filteredWorkshops = mockWorkshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workshop.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || workshop.category === selectedCategory
    const matchesType = selectedType === "All" || workshop.type === selectedType
    const matchesStatus = selectedStatus === "All" || workshop.status === selectedStatus
    return matchesSearch && matchesCategory && matchesType && matchesStatus
  })

  const handleWorkshopAction = (workshopId: string, action: string) => {
    console.log(`${action} workshop:`, workshopId)
    // In real app, make API call to perform action
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string }> = {
      scheduled: { color: "bg-blue-100 text-blue-800" },
      draft: { color: "bg-gray-100 text-gray-800" },
      completed: { color: "bg-green-100 text-green-800" },
      cancelled: { color: "bg-red-100 text-red-800" }
    }
    
    const config = variants[status] || variants.draft
    
    return (
      <Badge className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { color: string }> = {
      "In-Person": { color: "bg-purple-100 text-purple-800" },
      "Online": { color: "bg-green-100 text-green-800" },
      "Hybrid": { color: "bg-blue-100 text-blue-800" }
    }
    
    const config = variants[type] || variants["Online"]
    
    return (
      <Badge className={config.color}>
        {type === "In-Person" && <MapPin className="h-3 w-3 mr-1" />}
        {type === "Online" && <Video className="h-3 w-3 mr-1" />}
        {type === "Hybrid" && <Calendar className="h-3 w-3 mr-1" />}
        {type}
      </Badge>
    )
  }

  const totalWorkshops = mockWorkshops.length
  const scheduledWorkshops = mockWorkshops.filter(w => w.status === 'scheduled').length
  const draftWorkshops = mockWorkshops.filter(w => w.status === 'draft').length
  const totalRevenue = mockWorkshops.reduce((sum, w) => sum + (w.currentAttendees * (w.discountPrice || w.price)), 0)
  const totalAttendees = mockWorkshops.reduce((sum, w) => sum + w.currentAttendees, 0)

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Workshops Management</h1>
              <p className="mt-2 text-lg text-gray-600">
                Create and manage your workshop events
              </p>
            </div>
            <Link href="/admin/content/workshops/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Workshop
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkshops}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledWorkshops}</div>
              <p className="text-xs text-muted-foreground">
                Upcoming events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendees}</div>
              <p className="text-xs text-muted-foreground">
                Registered participants
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
              <div className="text-2xl font-bold">{draftWorkshops}</div>
              <p className="text-xs text-muted-foreground">
                In planning
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
                    placeholder="Search workshops..."
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

        {/* Workshops List */}
        <div className="space-y-4">
          {filteredWorkshops.map((workshop) => (
            <Card key={workshop.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{workshop.title}</h3>
                      {getStatusBadge(workshop.status)}
                      {getTypeBadge(workshop.type)}
                      <Badge variant="outline" className="text-xs">
                        {workshop.category}
                      </Badge>
                      {workshop.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{workshop.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(workshop.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{workshop.duration}h duration</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{workshop.currentAttendees}/{workshop.maxAttendees} attendees</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium text-green-600">
                          {workshop.discountPrice ? (
                            <>
                              <span className="line-through text-gray-400 mr-1">
                                {formatCurrency(workshop.price)}
                              </span>
                              {formatCurrency(workshop.discountPrice)}
                            </>
                          ) : (
                            formatCurrency(workshop.price)
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{workshop.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="truncate">by {workshop.instructor}</span>
                      </div>
                    </div>

                    {/* Attendance Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Registration Progress</span>
                        <span>{Math.round((workshop.currentAttendees / workshop.maxAttendees) * 100)}% full</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(workshop.currentAttendees / workshop.maxAttendees) * 100}%` 
                          }}
                        />
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
                        onClick={() => handleWorkshopAction(workshop.id, 'edit')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Workshop
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(`/workshops/${workshop.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Workshop
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleWorkshopAction(workshop.id, 'attendees')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Attendees
                      </DropdownMenuItem>
                      {workshop.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={() => handleWorkshopAction(workshop.id, 'publish')}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleWorkshopAction(workshop.id, 'duplicate')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {workshop.status === 'scheduled' && (
                        <DropdownMenuItem
                          onClick={() => handleWorkshopAction(workshop.id, 'cancel')}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel Workshop
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleWorkshopAction(workshop.id, 'delete')}
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

        {filteredWorkshops.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "All" || selectedType !== "All" || selectedStatus !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first workshop"
                }
              </p>
              {(!searchTerm && selectedCategory === "All" && selectedType === "All" && selectedStatus === "All") && (
                <Link href="/admin/content/workshops/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Workshop
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