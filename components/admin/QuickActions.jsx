"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Users,
  Megaphone,
  FileText,
  Settings,
  Download,
} from "lucide-react";

const quickActions = [
  {
    label: "View Users",
    href: "/admin-dashboard/users",
    icon: Users,
    color: "text-blue-500",
  },
  {
    label: "New Announcement",
    href: "/admin-dashboard/announcements?action=create",
    icon: Megaphone,
    color: "text-orange-500",
  },
  {
    label: "Export Reports",
    href: "/admin-dashboard/analytics",
    icon: Download,
    color: "text-green-500",
  },
  {
    label: "System Settings",
    href: "/admin-dashboard/settings",
    icon: Settings,
    color: "text-gray-500",
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col items-center gap-1"
                >
                  <Icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
