"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DesktopInstructorSidebar, MobileInstructorSidebar } from "./InstructorSidebar";
import { ProtectedRoute } from "@/components/auth";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useInstructorProfile } from "@/lib/hooks/useInstructor";
import { NotificationBell } from "@/components/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, User, Settings, LogOut } from "lucide-react";

// API base URL for images
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}/${imagePath}`;
};

export default function InstructorDashboardLayout({ children }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // Fetch fresh profile data (for profile picture updates)
  const { data: profileData } = useInstructorProfile();
  const profile = profileData?.data || profileData;

  useEffect(() => {
    if (!isLoading && user) {
      // Check lecturer approval status
      if (user.roles?.includes('LECTURER')) {
        if (user.lecturerStatus === 'pending') {
          router.push('/instructor-dashboard/pending');
        } else if (user.lecturerStatus === 'rejected') {
          router.push('/instructor-dashboard/rejected');
        }
      }
    }
  }, [isLoading, user, router]);

  // Show loading while checking status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render dashboard for pending/rejected lecturers (redirect will happen)
  if (user?.roles?.includes('LECTURER') && user?.lecturerStatus !== 'approved') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["LECTURER"]}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <DesktopInstructorSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-background">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <MobileInstructorSidebar />
              </div>
              <p className="text-sm text-muted-foreground italic hidden sm:block">
                "Teaching is the one profession that creates all other professions."
              </p>
            </div>

            {/* Right side - Notifications & User */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={getImageUrl(profile?.userImage || user.userImage)} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {user.firstname?.[0]}{user.lastname?.[0]}
                        </AvatarFallback>
                      </Avatar>
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
                      <Link href="/instructor-dashboard/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/instructor-dashboard/settings" className="cursor-pointer">
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
