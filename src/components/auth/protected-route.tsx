"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireProfile?: boolean
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/signin',
  requireProfile = false 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

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
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need to sign in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button asChild className="flex-1">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requireProfile && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Profile Required</CardTitle>
            <CardDescription>
              Please complete your profile to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/profile">Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}