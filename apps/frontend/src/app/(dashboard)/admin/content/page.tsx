"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamManager } from "./_components/team-manager";
import { SocialsManager } from "./_components/socials-manager";
import { ContactManager } from "./_components/contact-manager";
import { InquiryManager } from "./_components/inquiry-manager";

export default function AdminContentPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Site Content Management</h1>
                <p className="text-muted-foreground">Manage your website&apos;s public content: Team, Socials, and Contact Info.</p>
            </div>

            <Tabs defaultValue="team" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="team">Team Members</TabsTrigger>
                    <TabsTrigger value="socials">Social Handles</TabsTrigger>
                    <TabsTrigger value="contact">Contact Info</TabsTrigger>
                    <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
                </TabsList>

                <TabsContent value="team" className="space-y-4">
                    <TeamManager />
                </TabsContent>

                <TabsContent value="socials" className="space-y-4">
                    <SocialsManager />
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                    <ContactManager />
                </TabsContent>

                <TabsContent value="inquiries" className="space-y-4">
                    <InquiryManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
