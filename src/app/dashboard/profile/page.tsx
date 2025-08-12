"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuth } from "@/components/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle, User, Upload } from "lucide-react"

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    website: '',
    social_links: {
      twitter: '',
      linkedin: '',
      github: '',
    }
  })
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
        social_links: {
          twitter: profile.social_links?.twitter || '',
          linkedin: profile.social_links?.linkedin || '',
          github: profile.social_links?.github || '',
        }
      })
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '')
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialKey]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          bio: formData.bio,
          website: formData.website,
          social_links: formData.social_links,
          updated_at: new Date().toISOString()
        })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        await refreshProfile()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setLoading(true)
    setMessage(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        setMessage({ type: 'error', text: uploadError.message })
        return
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString()
        })

      if (updateError) {
        setMessage({ type: 'error', text: updateError.message })
      } else {
        setMessage({ type: 'success', text: 'Avatar updated successfully!' })
        await refreshProfile()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your personal information and preferences.
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Update your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user?.email || ''} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-center space-y-2">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild disabled={loading}>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {loading ? 'Uploading...' : 'Upload Photo'}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 text-center">
                    JPG, PNG or GIF. Max size: 2MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and social links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Social Links</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="social_twitter">Twitter</Label>
                        <Input
                          id="social_twitter"
                          name="social_twitter"
                          value={formData.social_links.twitter}
                          onChange={handleInputChange}
                          placeholder="@username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="social_linkedin">LinkedIn</Label>
                        <Input
                          id="social_linkedin"
                          name="social_linkedin"
                          value={formData.social_links.linkedin}
                          onChange={handleInputChange}
                          placeholder="linkedin.com/in/username"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="social_github">GitHub</Label>
                        <Input
                          id="social_github"
                          name="social_github"
                          value={formData.social_links.github}
                          onChange={handleInputChange}
                          placeholder="github.com/username"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      if (profile) {
                        setFormData({
                          full_name: profile.full_name || '',
                          bio: profile.bio || '',
                          website: profile.website || '',
                          social_links: {
                            twitter: profile.social_links?.twitter || '',
                            linkedin: profile.social_links?.linkedin || '',
                            github: profile.social_links?.github || '',
                          }
                        })
                      }
                    }}>
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}