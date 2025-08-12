"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface AdminRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

// For now, we'll use a simple email-based admin check
// In production, you'd want a proper role-based system
const ADMIN_EMAILS = [
  'shoraj@shorajtomer.me',
  'admin@shorajtomer.me',
  // Add your admin email here
]

export default function AdminRoute({ 
  children, 
  redirectTo = '/dashboard'
}: AdminRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin?redirect=/admin')
    } else if (!loading && user && !isAdmin) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo, isAdmin])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/signin?redirect=/admin">Sign In</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}