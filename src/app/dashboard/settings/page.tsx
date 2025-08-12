"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/components/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle, Settings, Bell, Shield, Eye } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [emailNotifications, setEmailNotifications] = useState({
    courseUpdates: true,
    workshopReminders: true,
    newContent: false,
    marketing: false
  })
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showProgress: true
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const supabase = createClient()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully!' })
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // In a real app, you'd want to handle this more carefully
      // This is a simplified version
      setMessage({ type: 'error', text: 'Account deletion is not implemented yet. Please contact support.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your account preferences and security settings.
          </p>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-md mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Course Updates</Label>
                  <div className="text-sm text-gray-500">
                    Get notified about new lessons and course materials
                  </div>
                </div>
                <Switch
                  checked={emailNotifications.courseUpdates}
                  onCheckedChange={(checked) =>
                    setEmailNotifications(prev => ({ ...prev, courseUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Workshop Reminders</Label>
                  <div className="text-sm text-gray-500">
                    Reminders about upcoming workshops you've registered for
                  </div>
                </div>
                <Switch
                  checked={emailNotifications.workshopReminders}
                  onCheckedChange={(checked) =>
                    setEmailNotifications(prev => ({ ...prev, workshopReminders: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Content</Label>
                  <div className="text-sm text-gray-500">
                    Notifications about new blog posts, stories, and content
                  </div>
                </div>
                <Switch
                  checked={emailNotifications.newContent}
                  onCheckedChange={(checked) =>
                    setEmailNotifications(prev => ({ ...prev, newContent: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing</Label>
                  <div className="text-sm text-gray-500">
                    Promotional emails about new courses and special offers
                  </div>
                </div>
                <Switch
                  checked={emailNotifications.marketing}
                  onCheckedChange={(checked) =>
                    setEmailNotifications(prev => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy
              </CardTitle>
              <CardDescription>
                Control your profile visibility and data sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <div className="text-sm text-gray-500">
                    Make your profile visible to other users
                  </div>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) =>
                    setPrivacy(prev => ({ ...prev, profileVisible: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Email</Label>
                  <div className="text-sm text-gray-500">
                    Display your email address on your public profile
                  </div>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) =>
                    setPrivacy(prev => ({ ...prev, showEmail: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Progress</Label>
                  <div className="text-sm text-gray-500">
                    Allow others to see your course progress and achievements
                  </div>
                </div>
                <Switch
                  checked={privacy.showProgress}
                  onCheckedChange={(checked) =>
                    setPrivacy(prev => ({ ...prev, showProgress: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))
                    }
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                    }
                    placeholder="Enter your new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-medium text-red-900">Delete Account</h3>
                  <p className="text-sm text-red-700">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}