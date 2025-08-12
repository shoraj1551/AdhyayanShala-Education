import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import AdminRoute from "@/components/auth/admin-route"
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BookOpen,
  Eye,
  ShoppingCart,
  Calendar,
  Download
} from "lucide-react"

// Mock analytics data - In real app, this would come from your analytics service
const analyticsData = {
  overview: {
    totalRevenue: {
      current: 45620,
      previous: 38940,
      growth: 17.2
    },
    totalUsers: {
      current: 1247,
      previous: 1089,
      growth: 14.5
    },
    coursesSold: {
      current: 892,
      previous: 743,
      growth: 20.1
    },
    avgOrderValue: {
      current: 89.50,
      previous: 82.30,
      growth: 8.7
    }
  },
  monthlyRevenue: [
    { month: 'Jan', revenue: 3200, users: 89 },
    { month: 'Feb', revenue: 4100, users: 123 },
    { month: 'Mar', revenue: 3800, users: 98 },
    { month: 'Apr', revenue: 5200, users: 156 },
    { month: 'May', revenue: 4900, users: 134 },
    { month: 'Jun', revenue: 6100, users: 187 },
    { month: 'Jul', revenue: 5800, users: 165 },
    { month: 'Aug', revenue: 7200, users: 203 },
    { month: 'Sep', revenue: 6800, users: 189 },
    { month: 'Oct', revenue: 8900, users: 234 },
    { month: 'Nov', revenue: 8200, users: 215 },
    { month: 'Dec', revenue: 9400, users: 267 }
  ],
  topContent: [
    {
      title: "Complete Web Development Bootcamp",
      type: "Course",
      revenue: 12450,
      enrollments: 124,
      rating: 4.8
    },
    {
      title: "Advanced JavaScript Mastery",
      type: "Course", 
      revenue: 8930,
      enrollments: 89,
      rating: 4.9
    },
    {
      title: "Modern Web Development Workshop",
      type: "Workshop",
      revenue: 5670,
      enrollments: 63,
      rating: 4.7
    },
    {
      title: "JavaScript Fundamentals Assessment",
      type: "Test",
      revenue: 2340,
      enrollments: 156,
      rating: 4.6
    }
  ],
  userEngagement: {
    dailyActiveUsers: 423,
    weeklyActiveUsers: 892,
    monthlyActiveUsers: 1247,
    avgSessionDuration: "12m 34s",
    bounceRate: 23.4,
    returnUserRate: 67.8
  }
}

export default function AdminAnalyticsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{growth.toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-lg text-gray-600">
                Track your business performance and user engagement
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analyticsData.overview.totalRevenue.current)}
              </div>
              {formatGrowth(analyticsData.overview.totalRevenue.growth)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.overview.totalUsers.current.toLocaleString()}
              </div>
              {formatGrowth(analyticsData.overview.totalUsers.growth)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Sold</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.overview.coursesSold.current.toLocaleString()}
              </div>
              {formatGrowth(analyticsData.overview.coursesSold.growth)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analyticsData.overview.avgOrderValue.current)}
              </div>
              {formatGrowth(analyticsData.overview.avgOrderValue.growth)}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Monthly Revenue Trend
              </CardTitle>
              <CardDescription>
                Revenue and user acquisition over the last 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.monthlyRevenue.slice(-6).map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium">{data.month}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(data.revenue / 10000) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(data.revenue)}</div>
                      <div className="text-xs text-gray-500">{data.users} users</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Engagement
              </CardTitle>
              <CardDescription>
                Current user activity and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.userEngagement.dailyActiveUsers}
                  </div>
                  <div className="text-xs text-gray-500">Daily Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.userEngagement.weeklyActiveUsers}
                  </div>
                  <div className="text-xs text-gray-500">Weekly Active Users</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Session Duration</span>
                  <span className="font-medium">{analyticsData.userEngagement.avgSessionDuration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bounce Rate</span>
                  <span className="font-medium">{analyticsData.userEngagement.bounceRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Return User Rate</span>
                  <span className="font-medium text-green-600">{analyticsData.userEngagement.returnUserRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Top Performing Content
            </CardTitle>
            <CardDescription>
              Your best-selling courses, workshops, and tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{content.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {content.type}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-xs text-gray-600">{content.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(content.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {content.enrollments} enrollments
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Analytics Actions</CardTitle>
            <CardDescription>
              Generate reports and export data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Custom Date Range
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart className="h-4 w-4 mr-2" />
                Detailed Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminRoute>
  )
}