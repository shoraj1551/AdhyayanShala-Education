"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getAdminContacts, createAdminContact, updateAdminContact, deleteAdminContact } from "@/lib/api";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
    { value: "EMAIL", label: "Email Address" },
    { value: "PHONE", label: "Phone Number" },
    { value: "OFFICE", label: "Office Address" },
];

interface Contact {
    id: string;
    category: string;
    label: string;
    value: string;
    description?: string;
    isPrimary: boolean;
    order: number;
    isActive: boolean;
}

export function ContactManager() {
    const { token } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const [formData, setFormData] = useState({
        category: "",
        label: "",
        value: "",
        description: "",
        isPrimary: false,
        order: 0,
        isActive: true
    });

    const fetchContacts = useCallback(() => {
        setLoading(true);
        getAdminContacts(token || "")
            .then(res => setContacts(res))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingContact) {
                await updateAdminContact(editingContact.id, formData, token || "");
                toast.success("Contact info updated");
            } else {
                await createAdminContact(formData, token || "");
                toast.success("Contact info created");
            }
            setOpen(false);
            fetchContacts();
        } catch {
            toast.error("Failed to save contact info");
        }
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setFormData({
            category: contact.category,
            label: contact.label,
            value: contact.value,
            description: contact.description || "",
            isPrimary: contact.isPrimary,
            order: contact.order,
            isActive: contact.isActive
        });
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteAdminContact(id, token || "");
            toast.success("Contact info deleted");
            fetchContacts();
        } catch {
            toast.error("Failed to delete contact info");
        }
    };

    const resetForm = () => {
        setEditingContact(null);
        setFormData({
            category: "",
            label: "",
            value: "",
            description: "",
            isPrimary: false,
            order: 0,
            isActive: true
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" /> Add Contact Info</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingContact ? "Edit Info" : "Add Info"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Label</Label>
                                <Input required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} placeholder="e.g. Student Support" />
                            </div>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input required value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} placeholder="e.g. support@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div className="space-y-2">
                                    <Label>Display Order</Label>
                                    <Input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-2 pt-6">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="is-primary" checked={formData.isPrimary} onCheckedChange={c => setFormData({ ...formData, isPrimary: c })} />
                                        <Label htmlFor="is-primary">Primary?</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Switch id="active-contact" checked={formData.isActive} onCheckedChange={c => setFormData({ ...formData, isActive: c })} />
                                        <Label htmlFor="active-contact">Active</Label>
                                    </div>
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
                            <TableHead>Category</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Primary</TableHead>
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
                        ) : contacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No contact info found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            contacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell>
                                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                            {contact.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium">{contact.label}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{contact.value}</TableCell>
                                    <TableCell>
                                        {contact.isPrimary && <span className="text-green-600 font-bold">Yes</span>}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(contact.id)}>
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
