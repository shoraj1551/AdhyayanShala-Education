"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Student {
    id: string;
    enrolledAt: string; // From Enrollment model
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    }
}

export default function CourseStudentsPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    // params.id comes from the folder name [id]
    // Fallback to courseId if for some reason we are in that context (unlikely after fix)
    const courseId = (params.id || params.courseId) as string;

    useEffect(() => {
        if (token && courseId) {
            fetchStudents();
        }
    }, [token, courseId]);

    const fetchStudents = async () => {
        try {
            const data = await api.get(`/courses/${courseId}/students`, token);
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch students", error);
            toast.error("Failed to load student list.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Enrolled Students</h1>
                    <p className="text-muted-foreground">Manage and view students enrolled in this course.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Total Students: {students.length}</CardTitle>
                        <Button variant="outline" size="sm" onClick={fetchStudents}>
                            Refresh List
                        </Button>
                    </div>
                    <CardDescription>
                        List of all students currently enrolled.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Enrolled Date</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading students...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No students enrolled yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={enrollment.user.avatar} />
                                                        <AvatarFallback>{enrollment.user.name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{enrollment.user.name}</p>
                                                        <p className="text-xs text-muted-foreground">ID: {enrollment.user.id.slice(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    {enrollment.user.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {enrollment.enrolledAt ? format(new Date(enrollment.enrolledAt), 'MMM dd, yyyy') : 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    Active
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
