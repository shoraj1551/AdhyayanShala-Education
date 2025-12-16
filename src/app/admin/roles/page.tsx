"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import AdminRoute from '@/components/auth/admin-route'
import { Shield, User as UserIcon, Loader2 } from 'lucide-react'

interface User {
    id: string
    full_name?: string
    email?: string
    role: 'user' | 'instructor' | 'admin'
    created_at: string
}

export default function RoleManagementPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/roles')
            const data = await response.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateRole = async (userId: string, newRole: string) => {
        setUpdating(userId)
        try {
            const response = await fetch('/api/admin/roles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            })

            if (response.ok) {
                // Update local state
                setUsers(users.map(u =>
                    u.id === userId ? { ...u, role: newRole as any } : u
                ))
            } else {
                alert('Failed to update role')
            }
        } catch (error) {
            console.error('Error updating role:', error)
            alert('Failed to update role')
        } finally {
            setUpdating(null)
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800'
            case 'instructor':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <AdminRoute>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Role Management
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600">
                        Manage user roles and permissions
                    </p>
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Users ({users.length})</CardTitle>
                            <CardDescription>
                                Assign roles to control user permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200">
                                                <UserIcon className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {user.full_name || 'No name'}
                                                </p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                            <Badge className={getRoleBadgeColor(user.role)}>
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={user.role}
                                                onValueChange={(value) => updateRole(user.id, value)}
                                                disabled={updating === user.id}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="instructor">Instructor</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {updating === user.id && (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminRoute>
    )
}
