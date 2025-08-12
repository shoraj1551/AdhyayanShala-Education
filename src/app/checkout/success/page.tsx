"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, BookOpen, Calendar } from 'lucide-react'
import ProtectedRoute from '@/components/auth/protected-route'

export default function CheckoutSuccess() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('session_id')
    setSessionId(id)
    setLoading(false)

    // Clear cart after successful purchase
    localStorage.removeItem('cart')
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-900">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Thank you for your purchase. Your enrollment has been confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• You'll receive a confirmation email shortly</li>
                <li>• Access your purchased content in your dashboard</li>
                <li>• Check your enrolled courses and workshops</li>
                <li>• Download your receipt and certificates</li>
              </ul>
            </div>

            {sessionId && (
              <div className="text-xs text-gray-500">
                <p>Transaction ID: {sessionId}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild size="sm">
                  <Link href="/courses">Browse Courses</Link>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <Link href="/workshops">View Workshops</Link>
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}