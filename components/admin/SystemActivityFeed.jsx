"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  UserPlus,
  BookOpen,
  CreditCard,
  AlertCircle,
  CheckCircle,
  LogIn,
  LogOut,
  User,
  Shield,
  Video,
  Bell,
  FolderOpen,
  Trash2,
  Edit,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { activityLogAPI } from "@/lib/api/activityLogs";

export default function SystemActivityFeed() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await activityLogAPI.getActivityLogs({ limit: 6 });
        setLogs(response.data || []);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActivityIcon = (action, category, status) => {
    // Failed actions
    if (status === "FAILED") {
      return { icon: XCircle, color: "text-red-500" };
    }

    // Auth icons
    if (action === "USER_LOGIN") return { icon: LogIn, color: "text-green-500" };
    if (action === "USER_LOGOUT") return { icon: LogOut, color: "text-gray-500" };
    if (action === "USER_REGISTER") return { icon: UserPlus, color: "text-blue-500" };
    if (action === "EMAIL_VERIFIED") return { icon: CheckCircle, color: "text-green-500" };
    if (action === "PASSWORD_RESET") return { icon: Shield, color: "text-orange-500" };

    // Course icons
    if (category === "COURSE") {
      if (action.includes("CREATED")) return { icon: BookOpen, color: "text-purple-500" };
      if (action.includes("DELETED")) return { icon: Trash2, color: "text-red-500" };
      if (action.includes("UPDATED")) return { icon: Edit, color: "text-blue-500" };
      if (action.includes("PUBLISHED")) return { icon: CheckCircle, color: "text-green-500" };
      if (action.includes("ENROLLED")) return { icon: BookOpen, color: "text-blue-500" };
      return { icon: BookOpen, color: "text-blue-500" };
    }

    // Lecturer icons
    if (category === "LECTURER") {
      if (action.includes("APPROVED")) return { icon: CheckCircle, color: "text-green-500" };
      if (action.includes("REJECTED")) return { icon: XCircle, color: "text-red-500" };
      return { icon: User, color: "text-orange-500" };
    }

    // Admin icons
    if (category === "ADMIN") return { icon: Shield, color: "text-primary" };

    // Live class icons
    if (category === "LIVE_CLASS") return { icon: Video, color: "text-pink-500" };

    // Announcement icons
    if (category === "ANNOUNCEMENT") return { icon: Bell, color: "text-yellow-500" };

    // Category icons
    if (category === "CATEGORY") return { icon: FolderOpen, color: "text-cyan-500" };

    return { icon: Activity, color: "text-gray-500" };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          System Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const { icon: Icon, color } = getActivityIcon(log.action, log.category, log.status);
              return (
                <div
                  key={log._id}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className={`mt-0.5 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{log.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Link href="/admin-dashboard/activity-logs">
          <Button variant="outline" className="w-full mt-4" size="sm">
            View All Logs
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
