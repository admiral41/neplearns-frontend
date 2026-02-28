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
  BookOpen,
  Video,
  Settings,
  LogOut,
  Menu,
  User,
  GraduationCap,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Calendar,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { useAuth } from "@/lib/providers/AuthProvider";

const navItems = [
  { href: "/student-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student-dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/student-dashboard/assignments", label: "Assignments", icon: FileText },
  { href: "/student-dashboard/live-classes", label: "Live Classes", icon: Video },
  // Tutoring Section
  {
    label: "Tutoring",
    icon: GraduationCap,
    children: [
      { href: "/student-dashboard/tutoring", label: "Browse Subjects", icon: BookOpen },
      { href: "/student-dashboard/tutoring/my-requests", label: "My Requests", icon: ClipboardList },
      { href: "/student-dashboard/tutoring/my-subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/student-dashboard/tutoring/sessions", label: "Sessions", icon: Calendar },
      { href: "/student-dashboard/tutoring/assignments", label: "Assignments", icon: FileText },
    ],
  },
  { href: "/student-dashboard/profile", label: "Profile", icon: User },
  { href: "/student-dashboard/settings", label: "Settings", icon: Settings },
];

function NavLink({ href, label, icon: Icon, onClick, isChild = false }) {
  const pathname = usePathname();
  const isActive = pathname === href ||
    (href !== "/student-dashboard" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md transition-colors text-sm",
        isChild ? "px-3 py-2 pl-9" : "px-3 py-2",
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
        <p className="text-xs text-slate-400 mt-0.5">Student</p>
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

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-56">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarContent onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:block w-52 border-r border-slate-100 sticky top-0 h-screen bg-white">
      <SidebarContent />
    </aside>
  );
}