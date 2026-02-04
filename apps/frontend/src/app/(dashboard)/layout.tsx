import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div className="hidden md:block w-64 border-r bg-muted/20">
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col h-full overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
