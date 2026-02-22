"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getAdminTeam, createAdminTeamMember, updateAdminTeamMember, deleteAdminTeamMember } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    email?: string;
    phone?: string;
    order: number;
    isActive: boolean;
}

export function TeamManager() {
    const { token } = useAuth();
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        bio: "",
        imageUrl: "",
        twitter: "",
        linkedin: "",
        website: "",
        email: "",
        phone: "",
        order: 0,
        isActive: true
    });

    const fetchTeam = useCallback(() => {
        setLoading(true);
        getAdminTeam(token || "")
            .then(res => setTeam(res))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMember) {
                await updateAdminTeamMember(editingMember.id, formData, token || "");
                toast.success("Team member updated");
            } else {
                await createAdminTeamMember(formData, token || "");
                toast.success("Team member created");
            }
            setOpen(false);
            fetchTeam();
        } catch {
            toast.error("Failed to save team member");
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            role: member.role,
            bio: member.bio,
            imageUrl: member.imageUrl,
            twitter: member.twitter || "",
            linkedin: member.linkedin || "",
            website: member.website || "",
            email: member.email || "",
            phone: member.phone || "",
            order: member.order,
            isActive: member.isActive
        });
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteAdminTeamMember(id, token || "");
            toast.success("Team member deleted");
            fetchTeam();
        } catch {
            toast.error("Failed to delete team member");
        }
    };

    const resetForm = () => {
        setEditingMember(null);
        setFormData({
            name: "",
            role: "",
            bio: "",
            imageUrl: "",
            twitter: "",
            linkedin: "",
            website: "",
            email: "",
            phone: "",
            order: 0,
            isActive: true
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Team Members</h2>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Add Member</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingMember ? "Edit Member" : "Add Member"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Bio</Label>
                                <Textarea required value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input required value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email (Optional)</Label>
                                    <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone (Optional)</Label>
                                    <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Twitter (Optional)</Label>
                                    <Input value={formData.twitter} onChange={e => setFormData({ ...formData, twitter: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>LinkedIn (Optional)</Label>
                                    <Input value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website (Optional)</Label>
                                    <Input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="space-y-2">
                                    <Label>Display Order</Label>
                                    <Input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Switch id="active" checked={formData.isActive} onCheckedChange={c => setFormData({ ...formData, isActive: c })} />
                                    <Label htmlFor="active">Active</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : team.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No team members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            team.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.order}</TableCell>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell>
                                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {member.isActive ? "Active" : "Inactive"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(member.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
