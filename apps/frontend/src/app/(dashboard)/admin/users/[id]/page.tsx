"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Shield, Mail, Calendar, CreditCard, GraduationCap, Ban, LogOut, Key, IndianRupee, BookOpen, User, Wallet } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const data = await api.get(`/admin/users/${id}`, token ?? undefined);
            setUser(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch user details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && token) fetchUser();
    }, [id, token]);

    const handleRoleUpdate = async (newRole: string) => {
        try {
            await api.patch(`/admin/users/${id}/role`, { role: newRole }, token!);
            toast.success(`Role updated to ${newRole}`);
            fetchUser();
        } catch (error: any) {
            toast.error(error.message || "Failed to update role");
        }
    };

    const handleBanUser = () => {
        toast.info("Ban simulated (API pending)");
    };

    if (loading) return <div className="p-8 text-center">Loading user profile...</div>;
    if (!user) return <div className="p-8 text-center text-red-500">User not found</div>;

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {user.name}
                        <Badge variant="outline" className="text-sm font-normal">
                            {user.role}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm">{user.id}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleBanUser} className="gap-2">
                        <Ban className="h-4 w-4" /> Ban User
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PROFILE CARD */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto h-24 w-24 mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-2xl">{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Joined {format(new Date(user.createdAt), 'PPP')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {user.email} (Verified)
                        </div>

                        <div className="pt-4 space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">MANAGE ROLE</label>
                            <div className="flex flex-wrap gap-2">
                                {['STUDENT', 'INSTRUCTOR', 'ADMIN'].map((role) => (
                                    <Button
                                        key={role}
                                        variant={user.role === role ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleRoleUpdate(role)}
                                        disabled={user.role === role}
                                        className="h-7 text-xs"
                                    >
                                        {role}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 space-y-2 border-t mt-4">
                            <label className="text-xs font-semibold text-muted-foreground">SECURITY ACTIONS</label>
                            <Button variant="outline" className="w-full justify-start gap-2 h-8 text-sm">
                                <Key className="h-3 w-3" /> Reset Password
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 h-8 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                <LogOut className="h-3 w-3" /> Force Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ACTIVITY TABS */}
                <Card className="md:col-span-2">
                    <Tabs defaultValue={user.role === 'INSTRUCTOR' ? 'courses' : 'enrollments'} className="w-full">
                        <CardHeader className="pb-2">
                            <TabsList className="bg-muted/50 p-1 w-fit flex-wrap h-auto">
                                {user.role === 'INSTRUCTOR' && <TabsTrigger value="courses">Created Courses</TabsTrigger>}
                                {user.role === 'INSTRUCTOR' && <TabsTrigger value="finance">Finance Details</TabsTrigger>}
                                <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
                                <TabsTrigger value="orders">Orders & Invoices</TabsTrigger>
                                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        <CardContent>
                            {/* INSTRUCTOR: Created Courses */}
                            <TabsContent value="courses" className="m-0 space-y-4">
                                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    Created Courses ({user.courses?.length || 0})
                                </h3>
                                {!user.courses?.length ? (
                                    <p className="text-muted-foreground text-sm">No courses created yet.</p>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Course Title</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Students</TableHead>
                                                    <TableHead>Est. Revenue</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {user.courses.map((course: any) => (
                                                    <TableRow key={course.id}>
                                                        <TableCell className="font-medium">{course.title}</TableCell>
                                                        <TableCell>₹{course.price}</TableCell>
                                                        <TableCell>{course._count?.enrollments || 0}</TableCell>
                                                        <TableCell className="text-green-600 font-medium">
                                                            ₹{(course.price * (course._count?.enrollments || 0)).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={course.isPublished ? "default" : "secondary"}>
                                                                {course.isPublished ? "Published" : "Draft"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </TabsContent>

                            {/* INSTRUCTOR: Finance */}
                            <TabsContent value="finance" className="m-0 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Card className="bg-emerald-50/50 border-emerald-100">
                                        <CardContent className="p-4">
                                            <div className="text-xs text-muted-foreground">Wallet Balance (Unpaid)</div>
                                            <div className="text-2xl font-bold text-emerald-700 flex items-center">
                                                <IndianRupee className="h-5 w-5 mr-1" />
                                                {user.walletBalance?.toLocaleString() || 0}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-blue-50/50 border-blue-100">
                                        <CardContent className="p-4">
                                            <div className="text-xs text-muted-foreground">Total Earnings (Lifetime)</div>
                                            <div className="text-2xl font-bold text-blue-700 flex items-center">
                                                <IndianRupee className="h-5 w-5 mr-1" />
                                                {user.totalEarnings?.toLocaleString() || 0}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm">Recent Payouts</h3>
                                    {!user.payouts?.length ? (
                                        <p className="text-xs text-muted-foreground">No payout history.</p>
                                    ) : (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Amount</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {user.payouts.map((p: any) => (
                                                        <TableRow key={p.id}>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {format(new Date(p.requestedAt), 'dd MMM yyyy')}
                                                            </TableCell>
                                                            <TableCell className="font-medium">₹{p.amount}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="enrollments" className="m-0 space-y-4">
                                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                    Enrolled Courses ({user.enrollments?.length || 0})
                                </h3>
                                {!user.enrollments?.length ? (
                                    <p className="text-muted-foreground text-sm">No active enrollments.</p>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Course</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {user.enrollments.map((enr: any, i: number) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-medium">{enr.course.title}</TableCell>
                                                        <TableCell>₹{enr.course.price}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="orders" className="m-0">
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No transaction history available yet.
                                </div>
                            </TabsContent>

                            <TabsContent value="activity" className="m-0">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <div className="text-sm">
                                            <span className="font-medium">User Login</span>
                                            <span className="text-muted-foreground ml-2 text-xs">2 minutes ago</span>
                                        </div>
                                        <Badge variant="outline">Success</Badge>
                                    </div>
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <div className="text-sm">
                                            <span className="font-medium">Profile Updated</span>
                                            <span className="text-muted-foreground ml-2 text-xs">1 day ago</span>
                                        </div>
                                        <Badge variant="outline">User Action</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-2">Full logs available in System Logs.</p>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
