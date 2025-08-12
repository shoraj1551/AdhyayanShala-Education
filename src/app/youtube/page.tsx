import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Eye, ThumbsUp, Calendar, ExternalLink, Youtube } from "lucide-react"

// Mock data - In real app, this would come from YouTube API via Supabase
const videos = [
  {
    id: "1",
    youtubeId: "dQw4w9WgXcQ",
    title: "Building a Full-Stack Next.js Application from Scratch",
    description: "Complete tutorial covering Next.js 14, TypeScript, Tailwind CSS, and Supabase integration. Perfect for beginners and intermediate developers.",
    thumbnail: "/api/placeholder/480/270",
    duration: "45:32",
    views: 15420,
    likes: 892,
    publishedAt: "2024-01-20T10:00:00Z",
    category: "Web Development",
    featured: true,
    tags: ["Next.js", "TypeScript", "Supabase", "Tutorial"]
  },
  {
    id: "2",
    youtubeId: "abc123def456",
    title: "Advanced React Hooks: useCallback, useMemo, and Custom Hooks",
    description: "Deep dive into React performance optimization using advanced hooks. Learn when and how to use them effectively.",
    thumbnail: "/api/placeholder/480/270",
    duration: "28:15",
    views: 8760,
    likes: 542,
    publishedAt: "2024-01-15T14:00:00Z",
    category: "React",
    featured: false,
    tags: ["React", "Hooks", "Performance"]
  },
  {
    id: "3",
    youtubeId: "ghi789jkl012",
    title: "The Art of Technical Storytelling",
    description: "How to explain complex technical concepts in a way that anyone can understand. Essential for developers and educators.",
    thumbnail: "/api/placeholder/480/270",
    duration: "22:48",
    views: 12340,
    likes: 678,
    publishedAt: "2024-01-10T16:00:00Z",
    category: "Communication",
    featured: true,
    tags: ["Storytelling", "Communication", "Teaching"]
  },
  {
    id: "4",
    youtubeId: "mno345pqr678",
    title: "Building Responsive Layouts with Tailwind CSS",
    description: "Master responsive design with Tailwind CSS. Learn the mobile-first approach and advanced layout techniques.",
    thumbnail: "/api/placeholder/480/270",
    duration: "35:20",
    views: 6890,
    likes: 423,
    publishedAt: "2024-01-05T12:00:00Z",
    category: "CSS",
    featured: false,
    tags: ["Tailwind CSS", "Responsive Design", "CSS"]
  },
  {
    id: "5",
    youtubeId: "stu901vwx234",
    title: "Database Design Best Practices",
    description: "Learn how to design efficient, scalable databases. Covers normalization, indexing, and performance optimization.",
    thumbnail: "/api/placeholder/480/270",
    duration: "42:10",
    views: 9120,
    likes: 567,
    publishedAt: "2023-12-28T11:00:00Z",
    category: "Database",
    featured: false,
    tags: ["Database", "SQL", "Design"]
  },
  {
    id: "6",
    youtubeId: "yza567bcd890",
    title: "JavaScript Fundamentals Every Developer Should Know",
    description: "Essential JavaScript concepts including closures, prototypes, async/await, and modern ES6+ features.",
    thumbnail: "/api/placeholder/480/270",
    duration: "38:45",
    views: 18750,
    likes: 1120,
    publishedAt: "2023-12-20T15:00:00Z",
    category: "JavaScript",
    featured: false,
    tags: ["JavaScript", "ES6", "Fundamentals"]
  }
]

const playlists = [
  {
    id: "playlist1",
    title: "Complete Web Development Course",
    description: "From beginner to advanced - everything you need to become a full-stack developer",
    videoCount: 24,
    totalDuration: "18 hours",
    thumbnail: "/api/placeholder/480/270",
    category: "Web Development"
  },
  {
    id: "playlist2",
    title: "React Mastery Series",
    description: "Master React.js with hands-on projects and real-world examples",
    videoCount: 16,
    totalDuration: "12 hours",
    thumbnail: "/api/placeholder/480/270",
    category: "React"
  },
  {
    id: "playlist3",
    title: "Content Creation for Developers",
    description: "Learn to create engaging technical content and build your personal brand",
    videoCount: 8,
    totalDuration: "6 hours",
    thumbnail: "/api/placeholder/480/270",
    category: "Content Creation"
  }
]

const categories = ["All", "Web Development", "React", "JavaScript", "CSS", "Database", "Communication", "Content Creation"]


const formatViews = (views: number) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 30) return `${diffDays} days ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export default function YouTube() {
  const featuredVideos = videos.filter(video => video.featured)
  const regularVideos = videos.filter(video => !video.featured)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          YouTube Channel
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Educational videos, tutorials, and engaging content for developers and learners
        </p>
        
        {/* Channel Stats & Subscribe */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">125K</div>
            <div className="text-sm text-gray-600">Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{videos.length}</div>
            <div className="text-sm text-gray-600">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatViews(videos.reduce((sum, video) => sum + video.views, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="https://youtube.com/@shorajtomer" target="_blank" rel="noopener noreferrer">
              <Youtube className="w-4 h-4 mr-2" />
              Subscribe
            </Link>
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            ⭐ Featured Videos
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {featuredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative group">
                  <div className="aspect-video bg-gradient-to-r from-red-500 to-pink-600 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="lg" className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30">
                        <Play className="h-6 w-6 text-white" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="absolute top-2 left-2 bg-white text-red-600 border-red-600"
                  >
                    Featured
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{video.category}</Badge>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatViews(video.views)}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {formatViews(video.likes)}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link 
                      href={`https://youtube.com/watch?v=${video.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red-600 transition-colors"
                    >
                      {video.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {video.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    {formatDate(video.publishedAt)}
                  </div>

                  <Button asChild className="w-full">
                    <Link 
                      href={`https://youtube.com/watch?v=${video.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Video
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Videos */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Play className="h-6 w-6 text-red-600" />
          Latest Videos
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularVideos.map((video) => (
            <Card key={video.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative group">
                <div className="aspect-video bg-gradient-to-r from-purple-500 to-red-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" className="rounded-full bg-white/20 hover:bg-white/30">
                      <Play className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(video.views)}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {formatViews(video.likes)}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-base line-clamp-2">
                  <Link 
                    href={`https://youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-600 transition-colors"
                  >
                    {video.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {video.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Calendar className="w-3 h-3" />
                  {formatDate(video.publishedAt)}
                </div>

                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link 
                    href={`https://youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Watch
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Playlists */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          📚 Featured Playlists
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Play className="h-8 w-8 mb-2" />
                  <div className="text-sm">{playlist.videoCount} videos</div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{playlist.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {playlist.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{playlist.videoCount} videos</span>
                  <span>{playlist.totalDuration}</span>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`https://youtube.com/playlist?list=${playlist.id}`} target="_blank" rel="noopener noreferrer">
                    <Play className="w-4 h-4 mr-2" />
                    View Playlist
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Don&apos;t Miss New Videos!
        </h2>
        <p className="text-gray-600 mb-6">
          Subscribe to my YouTube channel and get notified when I upload new tutorials and educational content.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="https://youtube.com/@shorajtomer" target="_blank" rel="noopener noreferrer">
              <Youtube className="w-4 h-4 mr-2" />
              Subscribe Now
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="https://youtube.com/@shorajtomer" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Channel
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}