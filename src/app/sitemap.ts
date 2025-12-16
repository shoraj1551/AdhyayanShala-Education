import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://shorajtomer.me'
  
  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/stories', 
    '/courses',
    '/workshops',
    '/tests',
    '/readings',
    '/youtube',
  ]

  const staticSitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // You can add dynamic routes here later by fetching from your database
  // For example, individual blog posts, courses, etc.
  
  return staticSitemap
}