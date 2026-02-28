"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Users,
  UserPlus,
  BookOpen,
  CreditCard,
  Wallet,
  BarChart3,
  Megaphone,
  Trophy,
  Activity,
  Settings,
  User,
  LogOut,
  Menu,
  ChevronDown,
  FileText,
  FolderOpen,
  Calendar,
  CalendarDays,
  PlayCircle,
  FileVideo,
  GraduationCap,
  Award,
  RefreshCcw,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { useAuth } from "@/lib/providers/AuthProvider";

// Navigation items - updated with Course Content section
const navItems = [
  { href: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-dashboard/users", label: "Users", icon: Users },
  { href: "/admin-dashboard/applications", label: "Applications", icon: UserPlus },
  
  // Course Management Section
   {
    label: "Courses",
    icon: BookOpen,
    children: [
      { href: "/admin-dashboard/courses", label: "All Courses", icon: BookOpen },
      { href: "/admin-dashboard/categories", label: "Categories", icon: FolderOpen },
      { href: "/admin-dashboard/weeks", label: "Course Weeks", icon: Calendar },
      { href: "/admin-dashboard/lessons", label: "Course Lessons", icon: PlayCircle },
      { href: "/admin-dashboard/assignments", label: "Assignments", icon: BookOpen },
      {
        href: "/admin-dashboard/quizzes",
        label: "Quiz Management",
        icon: FileText
      },
      { href: "/admin-dashboard/liveclass", label: "Live Classes", icon: FileVideo },
      { href: "/admin-dashboard/all-sessions", label: "All Sessions", icon: CalendarDays },
    ],
  },
  { href: "/admin-dashboard/enrollments", label: "Enrollments", icon: GraduationCap },

  // Tutoring Section
  {
    label: "Tutoring",
    icon: GraduationCap,
    children: [
      { href: "/admin-dashboard/tutoring-subjects", label: "Subjects", icon: BookOpen },
      { href: "/admin-dashboard/tutoring-requests", label: "Requests", icon: ClipboardList },
      { href: "/admin-dashboard/tutoring-subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/admin-dashboard/tutoring-payments", label: "Payments", icon: Wallet },
      { href: "/admin-dashboard/tutoring-sessions", label: "Sessions", icon: Calendar },
    ],
  },

  // Payments Section
  {
    label: "Payments",
    icon: CreditCard,
    children: [
      { href: "/admin-dashboard/payments", label: "All Payments", icon: CreditCard },
      { href: "/admin-dashboard/payments/payouts", label: "Payouts", icon: Wallet },
      { href: "/admin-dashboard/payments/refunds", label: "Refunds", icon: RefreshCcw },
    ],
  },

  { href: "/admin-dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin-dashboard/announcements", label: "Announcements", icon: Megaphone },
  
  // CMS Section
  {
    label: "CMS",
    icon: FileText,
    children: [
      { href: "/admin-dashboard/success-stories", label: "Success Stories", icon: Trophy },
      { href: "/admin-dashboard/features", label: "Why Choose Us", icon: Award },
    ],
  },
  
  { href: "/admin-dashboard/activity-logs", label: "Activity Logs", icon: Activity },
  { href: "/admin-dashboard/settings", label: "Settings", icon: Settings },
  { href: "/admin-dashboard/profile", label: "Profile", icon: User },
];

function NavLink({ href, label, icon: Icon, onClick, isChild = false }) {
  const pathname = usePathname();
  const isActive = pathname === href ||
    (href !== "/admin-dashboard" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md transition-colors text-sm",
        isChild ? "px-3 py-2 pl-10" : "px-3 py-2",
        isActive
          ? "bg-slate-100 text-slate-800 font-medium"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      )}
    >
      <Icon className={cn("shrink-0", isChild ? "h-4 w-4" : "h-4 w-4")} />
      <span>{label}</span>
    </Link>
  );
}

function NavParent({ item, onClick }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(() => {
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
            "flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors text-sm",
            hasActiveChild
              ? "bg-slate-100 text-slate-800 font-medium"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          )}
        >
          <span className="flex items-center gap-3">
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 mt-0.5">
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

  const handleLogout = () => {
    showAlert({
      title: "Logout",
      description: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: logout,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Brand - Text Only */}
      <div className="px-4 py-5 border-b border-slate-100">
        <h2 className="text-lg font-medium text-slate-800">NepLearns</h2>
        <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          item.children ? (
            <NavParent key={item.label} item={item} onClick={onLinkClick} />
          ) : (
            <NavLink key={item.href} {...item} onClick={onLinkClick} />
          )
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export function MobileAdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SheetHeader className="sr-only">
          <SheetTitle>Admin Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarContent onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function DesktopAdminSidebar() {
  return (
    <aside className="hidden lg:block w-64 border-r border-slate-100 sticky top-0 h-screen bg-white flex-shrink-0">
      <SidebarContent />
    </aside>
  );
}