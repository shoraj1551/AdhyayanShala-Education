"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdminRoute from "@/components/auth/admin-route"
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Calendar,
  BookOpen,
  Shield,
  Ban,
  UserCheck
} from "lucide-react"

// Mock data - In real app, this would come from Supabase
const mockUsers = [
  {
    id: "1",
    email: "john.doe@email.com",
    fullName: "John Doe",
    avatarUrl: null,
    createdAt: "2024-01-15T10:00:00Z",
    lastSignIn: "2024-01-20T14:30:00Z",
    enrolledCourses: 3,
    completedCourses: 1,
    totalSpent: 149.97,
    status: "active"
  },
  {
    id: "2", 
    email: "jane.smith@email.com",
    fullName: "Jane Smith",
    avatarUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=jane",
    createdAt: "2024-01-10T09:15:00Z",
    lastSignIn: "2024-01-19T16:45:00Z",
    enrolledCourses: 5,
    completedCourses: 3,
    totalSpent: 299.95,
    status: "active"
  },
  {
    id: "3",
    email: "mike.wilson@email.com", 
    fullName: "Mike Wilson",
    avatarUrl: null,
    createdAt: "2024-01-05T11:30:00Z",
    lastSignIn: "2024-01-18T10:20:00Z",
    enrolledCourses: 2,
    completedCourses: 0,
    totalSpent: 79.99,
    status: "active"
  },
  {
    id: "4",
    email: "sarah.johnson@email.com",
    fullName: "Sarah Johnson",
    avatarUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=sarah",
    createdAt: "2023-12-28T08:45:00Z",
    lastSignIn: "2024-01-17T13:15:00Z",
    enrolledCourses: 8,
    completedCourses: 5,
    totalSpent: 599.92,
    status: "premium"
  },
  {
    id: "5",
    email: "inactive.user@email.com",
    fullName: "Inactive User",
    avatarUrl: null,
    createdAt: "2023-11-15T12:00:00Z",
    lastSignIn: "2023-12-01T09:30:00Z",
    enrolledCourses: 1,
    completedCourses: 0,
    totalSpent: 29.99,
    status: "inactive"
  }
]

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const statuses = ["All", "active", "premium", "inactive"]

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All" || user.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleUserAction = (userId: string, action: string) => {
    console.log(`${action} user:`, userId)
    // In real app, make API call to perform action
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: "default", color: "bg-green-100 text-green-800" },
      premium: { variant: "default", color: "bg-purple-100 text-purple-800" },
      inactive: { variant: "secondary", color: "bg-gray-100 text-gray-800" }
    }
    
    const config = variants[status] || variants.active
    
    return (
      <Badge className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter(u => u.status === 'active').length
  const premiumUsers = mockUsers.filter(u => u.status === 'premium').length
  const totalRevenue = mockUsers.reduce((sum, u) => sum + u.totalSpent, 0)

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="mt-2 text-lg text-gray-600">
            View and manage user accounts and enrollments
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((activeUsers / totalUsers) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{premiumUsers}</div>
              <p className="text-xs text-muted-foreground">
                High-value customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From all users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
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
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName?.split(' ').map(n => n[0]).join('') || 
                         user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{user.fullName}</h3>
                        {getStatusBadge(user.status)}
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-600 mb-2">
                        <Mail className="h-3 w-3" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined: {formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Last seen: {formatDate(user.lastSignIn)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{user.enrolledCourses} enrolled</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">
                            {formatCurrency(user.totalSpent)} spent
                          </span>
                        </div>
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
                        onClick={() => handleUserAction(user.id, 'view')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUserAction(user.id, 'email')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUserAction(user.id, 'enrollments')}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Enrollments
                      </DropdownMenuItem>
                      {user.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="text-red-600"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="text-green-600"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Progress Bar for Course Completion */}
                {user.enrolledCourses > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Course Progress</span>
                      <span>
                        {user.completedCourses}/{user.enrolledCourses} completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(user.completedCourses / user.enrolledCourses) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== "All" 
                  ? "Try adjusting your search or filter criteria"
                  : "No users have registered yet"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminRoute>
  )
}