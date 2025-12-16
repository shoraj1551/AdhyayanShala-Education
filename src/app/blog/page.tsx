import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, User } from "lucide-react"

// Mock data - In real app, this would come from Supabase
const blogs = [
  {
    id: "1",
    title: "The Future of Education: Embracing Digital Learning",
    excerpt: "Exploring how technology is transforming the way we learn and teach in the modern world.",
    category: "Education",
    publishedAt: "2024-01-15",
    readTime: "8 min read",
    author: "Shoraj Tomer",
    featured: true
  },
  {
    id: "2",
    title: "The Art of Storytelling in Digital Age",
    excerpt: "How traditional storytelling techniques can be adapted for digital platforms and modern audiences.",
    category: "Storytelling",
    publishedAt: "2024-01-10",
    readTime: "6 min read",
    author: "Shoraj Tomer",
    featured: false
  },
  {
    id: "3",
    title: "Building Effective Online Workshops",
    excerpt: "A comprehensive guide to creating engaging and impactful virtual learning experiences.",
    category: "Workshops",
    publishedAt: "2024-01-05",
    readTime: "12 min read",
    author: "Shoraj Tomer",
    featured: false
  },
  {
    id: "4",
    title: "The Power of Continuous Learning",
    excerpt: "Why lifelong learning is essential in today's rapidly changing world and how to cultivate it.",
    category: "Personal Development",
    publishedAt: "2023-12-28",
    readTime: "5 min read",
    author: "Shoraj Tomer",
    featured: false
  }
]

const categories = ["All", "Education", "Storytelling", "Workshops", "Personal Development", "Technology"]

export default function Blog() {
  const featuredBlog = blogs.find(blog => blog.featured)
  const regularBlogs = blogs.filter(blog => !blog.featured)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Blog & Articles
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Thoughts, insights, and stories from my journey
        </p>
      </div>

      {/* Categories Filter */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Article */}
      {featuredBlog && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <div className="md:w-2/3 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{featuredBlog.category}</Badge>
                  <Badge variant="outline">Featured</Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {featuredBlog.title}
                </h3>
                <p className="text-gray-600 mb-4">{featuredBlog.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredBlog.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(featuredBlog.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredBlog.readTime}
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/blog/${featuredBlog.id}`}>Read Full Article</Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Regular Articles */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Articles</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {regularBlogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{blog.category}</Badge>
                  <span className="text-sm text-gray-500">{blog.readTime}</span>
                </div>
                <CardTitle className="line-clamp-2">
                  <Link href={`/blog/${blog.id}`} className="hover:text-blue-600 transition-colors">
                    {blog.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {blog.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blog.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(blog.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/blog/${blog.id}`}>Read More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Load More */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg">
          Load More Articles
        </Button>
      </div>
    </div>
  )
}