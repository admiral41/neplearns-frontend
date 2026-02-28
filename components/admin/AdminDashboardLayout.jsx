"use client";

import Link from "next/link";
import { DesktopAdminSidebar, MobileAdminSidebar } from "./AdminSidebar";
import { GraduationCap, User, Settings, LogOut } from "lucide-react";
import { ProtectedRoute } from "@/components/auth";
import { NotificationBell } from "@/components/notifications";
import { useAuth } from "@/lib/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// API base URL for images
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}/${imagePath}`;
};

export default function AdminDashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <DesktopAdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - Both Mobile and Desktop */}
          <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-background">
            {/* Left side */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <div className="lg:hidden">
                <MobileAdminSidebar />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">Empowering Learners</span>
              </div>
            </div>

            {/* Right side - Notifications & User */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={getImageUrl(user.userImage)} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {user.firstname?.[0]}{user.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-muted-foreground">
                        {user.firstname}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.firstname} {user.lastname}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin-dashboard/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin-dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
