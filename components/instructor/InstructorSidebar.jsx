"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/lib/providers/SettingsProvider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  User,
  ChevronDown,
  FolderOpen,
  Calendar,
  CalendarDays,
  PlayCircle,
  FileText,
  FileVideo,
  GraduationCap,
  CreditCard,
  Wallet,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { useAuth } from "@/lib/providers/AuthProvider";

const navItems = [
  { href: "/instructor-dashboard", label: "Dashboard", icon: LayoutDashboard },

  // Course Management Section (same structure as admin)
  {
    label: "Courses",
    icon: BookOpen,
    children: [
      { href: "/instructor-dashboard/courses", label: "All Courses", icon: BookOpen },
      { href: "/instructor-dashboard/weeks", label: "Course Weeks", icon: Calendar },
      { href: "/instructor-dashboard/lessons", label: "Course Lessons", icon: PlayCircle },
      { href: "/instructor-dashboard/assignments", label: "Assignments", icon: ClipboardList },
      { href: "/instructor-dashboard/quizzes", label: "Quiz Management", icon: FileText },
      { href: "/instructor-dashboard/live-classes", label: "Live Classes", icon: FileVideo },
      { href: "/instructor-dashboard/my-sessions", label: "My Sessions", icon: CalendarDays },
    ],
  },

  // Tutoring Section
  {
    label: "Tutoring",
    icon: GraduationCap,
    children: [
      { href: "/instructor-dashboard/tutoring/students", label: "My Students", icon: Users },
      { href: "/instructor-dashboard/tutoring/sessions", label: "Sessions", icon: ClipboardList },
      { href: "/instructor-dashboard/tutoring/assignments", label: "Assignments", icon: FileText },
      { href: "/instructor-dashboard/tutoring/earnings", label: "Earnings", icon: Wallet },
    ],
  },

  { href: "/instructor-dashboard/tools", label: "My Tools", icon: Wrench },
  { href: "/instructor-dashboard/students", label: "Students", icon: Users },
  { href: "/instructor-dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/instructor-dashboard/profile", label: "Profile", icon: User },
  { href: "/instructor-dashboard/settings", label: "Settings", icon: Settings },
];

function NavLink({ href, label, icon: Icon, onClick, isChild = false }) {
  const pathname = usePathname();
  const isActive = pathname === href ||
    (href !== "/instructor-dashboard" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg transition-colors text-sm",
        isChild ? "px-3 py-2 pl-10" : "px-3 py-2.5",
        isActive
          ? "text-primary font-semibold bg-primary/5"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <Icon className={cn("shrink-0", isChild ? "h-4 w-4" : "h-5 w-5")} />
      <span>{label}</span>
    </Link>
  );
}

function NavParent({ item, onClick }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(() => {
    // Auto-expand if any child is active
    return item.children?.some(child =>
      pathname === child.href || pathname.startsWith(child.href + "/")
    );
  });

  const Icon = item.icon;
  const hasActiveChild = item.children?.some(child =>
    pathname === child.href || pathname.startsWith(child.href + "/")
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors text-sm",
            hasActiveChild
              ? "text-primary font-semibold bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <span className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 mt-1">
        {item.children?.map((child) => (
          <NavLink
            key={child.href}
            {...child}
            onClick={onClick}
            isChild
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarContent({ onLinkClick }) {
  const { showAlert } = useAlertDialog();
  const { logout } = useAuth();
  const { getLogoUrl, getPlatformName } = useSettings();

  const handleLogout = () => {
    showAlert({
      title: "Logout",
      description:
        "Are you sure you want to logout? You'll need to login again to access your dashboard.",
      confirmText: "Logout",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        logout();
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="px-4 py-5 border-b">
        <div className="flex items-center gap-2">
          {/* <img
            src={getLogoUrl()}
            alt={`${getPlatformName()} Logo`}
            className="w-10 h-10 rounded-lg object-contain"
          /> */}
          <div>
            <h2 className="text-lg font-bold text-primary">{getPlatformName()}</h2>
            <p className="text-xs text-muted-foreground">Instructor Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          item.children ? (
            <NavParent key={item.label} item={item} onClick={onLinkClick} />
          ) : (
            <NavLink key={item.href} {...item} onClick={onLinkClick} />
          )
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function MobileInstructorSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarContent onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function DesktopInstructorSidebar() {
  return (
    <aside className="hidden lg:flex w-64 border-r sticky top-0 h-screen flex-shrink-0">
      <SidebarContent />
    </aside>
  );
}
