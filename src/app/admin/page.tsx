import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AdminRoute from "@/components/auth/admin-route"
import { 
  BarChart, 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Activity,
  Eye,
  ShoppingCart,
  MessageCircle,
  Settings
} from "lucide-react"
import Link from "next/link"

// Mock data - In real app, this would come from Supabase analytics
const adminStats = {
  users: {
    total: 1247,
    newThisMonth: 156,
    active: 892,
    growth: 12.5
  },
  content: {
    blogs: 23,
    stories: 18,
    courses: 8,
    workshops: 12,
    tests: 15
  },
  revenue: {
    total: 45620,
    thisMonth: 8920,
    lastMonth: 7840,
    growth: 13.8
  },
  enrollments: {
    total: 2341,
    thisMonth: 345,
    pending: 12,
    completed: 2329
  }
}

const recentActivity = [
  {
    type: 'user_signup',
    description: 'New user registered: john.doe@email.com',
    timestamp: '2 minutes ago',
    status: 'success'
  },
  {
    type: 'course_purchase',
    description: 'Course purchased: Complete Web Development Bootcamp',
    timestamp: '15 minutes ago',
    status: 'success'
  },
  {
    type: 'workshop_registration',
    description: 'Workshop registration: Modern Web Development Workshop',
    timestamp: '1 hour ago',
    status: 'success'
  },
  {
    type: 'payment_failed',
    description: 'Payment failed for Advanced JavaScript Mastery',
    timestamp: '2 hours ago',
    status: 'error'
  },
  {
    type: 'blog_published',
    description: 'New blog post published: The Future of Web Development',
    timestamp: '3 hours ago',
    status: 'info'
  }
]

export default function AdminDashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your content, users, and business analytics.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.users.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{adminStats.users.newThisMonth}</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(adminStats.revenue.total)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{adminStats.revenue.growth}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.enrollments.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{adminStats.enrollments.thisMonth}</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.users.active.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((adminStats.users.active / adminStats.users.total) * 100)}% of total users
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/admin/content/blogs/new">
                  <FileText className="h-4 w-4 mr-2" />
                  Create New Blog Post
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/content/courses/new">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add New Course
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/content/workshops/new">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Workshop
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Content Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Content Overview
              </CardTitle>
              <CardDescription>
                Your published content statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Blog Posts</span>
                </div>
                <Badge variant="secondary">{adminStats.content.blogs}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Courses</span>
                </div>
                <Badge variant="secondary">{adminStats.content.courses}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Workshops</span>
                </div>
                <Badge variant="secondary">{adminStats.content.workshops}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Stories</span>
                </div>
                <Badge variant="secondary">{adminStats.content.stories}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Tests</span>
                </div>
                <Badge variant="secondary">{adminStats.content.tests}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest system activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" asChild className="w-full">
                <Link href="/admin/activity">View All Activity</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Content Management
              </CardTitle>
              <CardDescription>
                Manage blogs, stories, courses, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/admin/content">
                    <FileText className="h-4 w-4 mr-2" />
                    All Content
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/admin/content/blogs">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Blog Posts
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/admin/content/courses">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Courses
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                User Management
              </CardTitle>
              <CardDescription>
                View and manage user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    All Users
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/admin/enrollments">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Enrollments
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/admin/payments">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payments
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-purple-600" />
                Analytics
              </CardTitle>
              <CardDescription>
                View detailed analytics and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/admin/analytics">
                    <BarChart className="h-4 w-4 mr-2" />
                    Overview
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/admin/analytics/revenue">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Revenue
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/admin/analytics/content">
                    <Eye className="h-4 w-4 mr-2" />
                    Content Performance
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  )
}