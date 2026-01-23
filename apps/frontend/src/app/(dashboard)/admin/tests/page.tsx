"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle, Edit } from "lucide-react";

export default function AdminTestListPage() {
    const { token, user } = useAuth();
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.get('/tests', token)
                .then(setTests)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
        return <div className="p-8">Access Denied. Admins only.</div>;
    }

    if (loading) return <div className="p-8">Loading tests...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Tests</h1>
                <Link href="/admin/tests/create">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Test
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tests.map((test) => (
                    <Card key={test.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl">{test.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground mb-4">
                                {test.course?.title ? `Linked to: ${test.course.title}` : 'No Course Linked'}
                                <br />
                                {test._count?.questions} Questions
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/admin/tests/${test.id}`} className="w-full">
                                    <Button variant="outline" className="w-full">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Content
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
