"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/auth";
import { LogOut, Users, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Quotes Admin</h1>
        </div>
        
        <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link
            href="/dashboard/users"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </Link>
          
          <Link
            href="/dashboard/topics"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span>Topics</span>
          </Link>
          
          <Link
            href="/dashboard/quotes"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Quotes</span>
          </Link>
        </nav>
        
        <div className="px-4 mt-auto pb-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-muted/40">
        {children}
      </main>
    </div>
  );
}
