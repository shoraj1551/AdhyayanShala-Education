import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Heart, Eye, BookOpen } from "lucide-react"

// Mock data - In real app, this would come from Supabase
const stories = [
  {
    id: "1",
    title: "The Digital Nomad's Awakening",
    excerpt: "Sarah thought remote work would be her freedom. Instead, she found herself trapped in a different kind of cage...",
    genre: "Fiction",
    readTime: 12,
    likes: 45,
    views: 320,
    isPremium: false,
    publishedAt: "2024-01-20",
    featuredImage: "/api/placeholder/400/250"
  },
  {
    id: "2", 
    title: "The Last Bookstore",
    excerpt: "In a world where everything is digital, Marcus runs the last physical bookstore. But today, he receives a mysterious customer...",
    genre: "Science Fiction",
    readTime: 8,
    likes: 67,
    views: 540,
    isPremium: true,
    publishedAt: "2024-01-15",
    featuredImage: "/api/placeholder/400/250"
  },
  {
    id: "3",
    title: "Lessons from My Grandmother's Kitchen",
    excerpt: "Growing up, I never understood why grandma insisted on making everything from scratch. Now, I finally get it...",
    genre: "Memoir",
    readTime: 6,
    likes: 89,
    views: 420,
    isPremium: false,
    publishedAt: "2024-01-10",
    featuredImage: "/api/placeholder/400/250"
  },
  {
    id: "4",
    title: "The Code That Changed Everything",
    excerpt: "A simple algorithm, written in frustration at 3 AM, would go on to revolutionize how we think about artificial intelligence...",
    genre: "Technology",
    readTime: 15,
    likes: 156,
    views: 890,
    isPremium: true,
    publishedAt: "2024-01-05",
    featuredImage: "/api/placeholder/400/250"
  },
  {
    id: "5",
    title: "The Midnight Train to Nowhere",
    excerpt: "Every night at 11:47 PM, a train passes through our small town. Tonight, for the first time in 20 years, it stopped...",
    genre: "Mystery",
    readTime: 10,
    likes: 78,
    views: 650,
    isPremium: false,
    publishedAt: "2023-12-30",
    featuredImage: "/api/placeholder/400/250"
  },
  {
    id: "6",
    title: "Building Dreams in Code",
    excerpt: "From a small town with no internet to Silicon Valley's biggest tech companies. This is my journey of turning dreams into reality...",
    genre: "Biography",
    readTime: 20,
    likes: 234,
    views: 1200,
    isPremium: true,
    publishedAt: "2023-12-25",
    featuredImage: "/api/placeholder/400/250"
  }
]

const genres = ["All", "Fiction", "Science Fiction", "Memoir", "Technology", "Mystery", "Biography"]

export default function Stories() {
  const featuredStories = stories.filter(story => story.likes > 100)
  const regularStories = stories.filter(story => story.likes <= 100)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Stories & Tales
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Creative stories that inspire, entertain, and teach valuable lessons
        </p>
      </div>

      {/* Genre Filter */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-2 justify-center">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={genre === "All" ? "default" : "outline"}
              className="mb-2"
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Featured Stories
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {featuredStories.map((story) => (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-r from-purple-500 to-pink-600"></div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{story.genre}</Badge>
                    <div className="flex items-center gap-2">
                      {story.isPremium && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Premium
                        </Badge>
                      )}
                      <Badge variant="outline">Featured</Badge>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/stories/${story.id}`} className="hover:text-purple-600 transition-colors">
                      {story.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {story.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {story.readTime} min read
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {story.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {story.views}
                      </div>
                    </div>
                    <span>{new Date(story.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/stories/${story.id}`}>Read Story</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Stories */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          All Stories
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularStories.map((story) => (
            <Card key={story.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{story.genre}</Badge>
                  {story.isPremium && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-2">
                  <Link href={`/stories/${story.id}`} className="hover:text-purple-600 transition-colors">
                    {story.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {story.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {story.readTime}m
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {story.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {story.views}
                    </div>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/stories/${story.id}`}>Read Story</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Load More */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg">
          Load More Stories
        </Button>
      </div>
    </div>
  )
}