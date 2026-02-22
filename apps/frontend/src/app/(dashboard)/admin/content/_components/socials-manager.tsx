"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getAdminSocials, createAdminSocial, updateAdminSocial, deleteAdminSocial } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import * as LucideIcons from "lucide-react";

const SOCIAL_PLATFORMS = ["Twitter", "LinkedIn", "Instagram", "Youtube", "Facebook", "Github", "Globe"];

// Helper to render icon dynamically
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[name];
    return Icon ? <Icon className={className} /> : <LucideIcons.Link className={className} />;
};

interface SocialHandle {
    id: string;
    platform: string;
    url: string;
    icon: string;
    order: number;
    isActive: boolean;
}

export function SocialsManager() {
    const { token } = useAuth();
    const [socials, setSocials] = useState<SocialHandle[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingSocial, setEditingSocial] = useState<SocialHandle | null>(null);

    const [formData, setFormData] = useState({
        platform: "",
        url: "",
        icon: "",
        order: 0,
        isActive: true
    });

    const fetchSocials = useCallback(() => {
        setLoading(true);
        getAdminSocials(token || "")
            .then(res => setSocials(res))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        fetchSocials();
    }, [fetchSocials]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSocial) {
                await updateAdminSocial(editingSocial.id, formData, token || "");
                toast.success("Social link updated");
            } else {
                await createAdminSocial(formData, token || "");
                toast.success("Social link created");
            }
            setOpen(false);
            fetchSocials();
        } catch {
            toast.error("Failed to save social link");
        }
    };

    const handleEdit = (social: SocialHandle) => {
        setEditingSocial(social);
        setFormData({
            platform: social.platform,
            url: social.url,
            icon: social.icon || "",
            order: social.order,
            isActive: social.isActive
        });
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteAdminSocial(id, token || "");
            toast.success("Social link deleted");
            fetchSocials();
        } catch {
            toast.error("Failed to delete social link");
        }
    };

    const resetForm = () => {
        setEditingSocial(null);
        setFormData({
            platform: "",
            url: "",
            icon: "",
            order: 0,
            isActive: true
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Social Handles</h2>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Add Social</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSocial ? "Edit Social" : "Add Social"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Platform Name</Label>
                                <Input required value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} placeholder="e.g. Twitter" />
                            </div>
                            <div className="space-y-2">
                                <Label>Profile URL</Label>
                                <Input required value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <Select value={formData.icon} onValueChange={(val) => setFormData({ ...formData, icon: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SOCIAL_PLATFORMS.map(p => (
                                            <SelectItem key={p} value={p}>
                                                <div className="flex items-center gap-2">
                                                    <DynamicIcon name={p} className="h-4 w-4" />
                                                    {p}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="space-y-2">
                                    <Label>Display Order</Label>
                                    <Input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Switch id="active-social" checked={formData.isActive} onCheckedChange={c => setFormData({ ...formData, isActive: c })} />
                                    <Label htmlFor="active-social">Active</Label>
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
                            <TableHead>Icon</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>URL</TableHead>
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
                        ) : socials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No social handles found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            socials.map((social) => (
                                <TableRow key={social.id}>
                                    <TableCell>{social.order}</TableCell>
                                    <TableCell>
                                        <DynamicIcon name={social.icon || 'Link'} className="h-5 w-5" />
                                    </TableCell>
                                    <TableCell className="font-medium">{social.platform}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{social.url}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(social)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(social.id)}>
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
