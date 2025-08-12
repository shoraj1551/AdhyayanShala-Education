import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, BookOpen, ExternalLink, Heart, Filter } from "lucide-react"

// Mock data - In real app, this would come from Supabase
const readings = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Development",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones. Transform your life through the compound effect of small changes.",
    coverUrl: "/api/placeholder/200/300",
    rating: 5,
    review: "This book completely changed how I think about building habits. The 1% better every day philosophy is incredibly powerful and practical.",
    purchaseLink: "https://amazon.com/atomic-habits",
    featured: true,
    readingTime: "6-8 hours",
    pages: 320,
    publishedYear: 2018
  },
  {
    id: "2",
    title: "The Pragmatic Programmer",
    author: "David Thomas, Andrew Hunt",
    category: "Programming",
    description: "From Journeyman to Master. Essential reading for any programmer who wants to improve their craft and approach to software development.",
    coverUrl: "/api/placeholder/200/300",
    rating: 5,
    review: "A timeless classic that every developer should read. Practical advice that has shaped my programming career.",
    purchaseLink: "https://amazon.com/pragmatic-programmer",
    featured: false,
    readingTime: "10-12 hours",
    pages: 352,
    publishedYear: 2019
  },
  {
    id: "3",
    title: "Storytelling with Data",
    author: "Cole Nussbaumer Knaflic",
    category: "Data Science",
    description: "A Data Visualization Guide for Business Professionals. Learn to tell compelling stories with your data through effective visualization.",
    coverUrl: "/api/placeholder/200/300",
    rating: 4,
    review: "Excellent guide for making data presentations more impactful. Changed how I approach data visualization completely.",
    purchaseLink: "https://amazon.com/storytelling-data",
    featured: false,
    readingTime: "4-5 hours",
    pages: 288,
    publishedYear: 2015
  },
  {
    id: "4",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Programming",
    description: "A Handbook of Agile Software Craftsmanship. Learn to write code that is clean, readable, and maintainable.",
    coverUrl: "/api/placeholder/200/300",
    rating: 5,
    review: "Essential reading for any serious programmer. This book teaches you to write code that humans can understand.",
    purchaseLink: "https://amazon.com/clean-code",
    featured: true,
    readingTime: "8-10 hours",
    pages: 464,
    publishedYear: 2008
  },
  {
    id: "5",
    title: "The Elements of Style",
    author: "William Strunk Jr., E.B. White",
    category: "Writing",
    description: "The classic guide to writing well. Concise, practical advice on the art of clear and effective communication.",
    coverUrl: "/api/placeholder/200/300",
    rating: 4,
    review: "A compact masterpiece. Every writer should keep this book within arm's reach for quick reference.",
    purchaseLink: "https://amazon.com/elements-style",
    featured: false,
    readingTime: "2-3 hours",
    pages: 105,
    publishedYear: 2000
  },
  {
    id: "6",
    title: "Digital Minimalism",
    author: "Cal Newport",
    category: "Lifestyle",
    description: "Choosing a Focused Life in a Noisy World. A philosophy for technology use that focuses on what truly matters.",
    coverUrl: "/api/placeholder/200/300",
    rating: 4,
    review: "Important read in our digital age. Practical strategies for reclaiming focus and intentional living.",
    purchaseLink: "https://amazon.com/digital-minimalism",
    featured: false,
    readingTime: "5-6 hours",
    pages: 284,
    publishedYear: 2019
  },
  {
    id: "7",
    title: "The Art of Explanation",
    author: "Lee LeFever",
    category: "Communication",
    description: "Making your Ideas, Products, and Services Easier to Understand. Master the skill of clear, compelling explanation.",
    coverUrl: "/api/placeholder/200/300",
    rating: 4,
    review: "Great insights on making complex ideas accessible. Valuable for educators, presenters, and communicators.",
    purchaseLink: "https://amazon.com/art-explanation",
    featured: false,
    readingTime: "4-5 hours",
    pages: 256,
    publishedYear: 2013
  },
  {
    id: "8",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "Psychology",
    description: "Explores the two systems that drive the way we think. A fascinating look at human decision-making and cognitive biases.",
    coverUrl: "/api/placeholder/200/300",
    rating: 5,
    review: "Mind-blowing insights into human psychology and decision-making. Changed how I think about thinking itself.",
    purchaseLink: "https://amazon.com/thinking-fast-slow",
    featured: true,
    readingTime: "12-15 hours",
    pages: 499,
    publishedYear: 2011
  }
]

const categories = ["All", "Self-Development", "Programming", "Data Science", "Writing", "Lifestyle", "Communication", "Psychology"]

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < rating ? "fill-current text-yellow-400" : "text-gray-300"
      }`}
    />
  ))
}

export default function Readings() {
  const featuredReadings = readings.filter(book => book.featured)
  const regularReadings = readings.filter(book => !book.featured)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Reading List & Recommendations
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Curated books that have shaped my thinking and can help you grow
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
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

      {/* Featured Books */}
      {featuredReadings.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Must-Read Recommendations
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredReadings.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="aspect-[3/4] bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  <Badge 
                    variant="outline" 
                    className="absolute top-2 right-2 bg-white text-yellow-600 border-yellow-600"
                  >
                    Featured
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{book.category}</Badge>
                    <div className="flex items-center gap-1">
                      {renderStars(book.rating)}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                  <CardDescription>by {book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {book.description}
                  </p>
                  
                  <div className="text-sm text-gray-500 mb-4 space-y-1">
                    <div>📖 {book.pages} pages • {book.readingTime}</div>
                    <div>📅 Published: {book.publishedYear}</div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">My Review:</h4>
                    <p className="text-sm text-gray-600 italic">"{book.review}"</p>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={book.purchaseLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Get Book
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Books */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Complete Reading List
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {regularReadings.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] bg-gradient-to-br from-indigo-500 to-blue-600"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                  <div className="flex items-center gap-1">
                    {renderStars(book.rating)}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                <CardDescription className="text-sm">by {book.author}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {book.description}
                </p>
                
                <div className="text-xs text-gray-500 mb-3">
                  {book.pages} pages • {book.publishedYear}
                </div>

                <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 italic mb-3 line-clamp-2">
                  "{book.review}"
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={book.purchaseLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Get Book
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Reading Stats */}
      <section className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Reading Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {readings.length}
            </div>
            <div className="text-sm text-gray-600">Books Recommended</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {categories.length - 1}
            </div>
            <div className="text-sm text-gray-600">Categories Covered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(readings.reduce((sum, book) => sum + book.rating, 0) / readings.length * 10) / 10}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {readings.reduce((sum, book) => sum + book.pages, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Pages</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Have a Book Recommendation?</CardTitle>
            <CardDescription>
              I'm always looking for great books to read and share with the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/contact">Suggest a Book</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}