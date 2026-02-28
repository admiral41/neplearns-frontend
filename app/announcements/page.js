"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  AlertCircle,
  Megaphone,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  useAnnouncements,
  useMarkAnnouncementRead,
} from "@/lib/hooks/useAnnouncements";

export default function AnnouncementsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: response, isLoading } = useAnnouncements({ page, limit });
  const markAsReadMutation = useMarkAnnouncementRead();

  const announcements = response?.data?.announcements || [];
  const pagination = response?.data?.pagination || {};
  const unreadCount = response?.data?.unreadCount || 0;

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const getPriorityStyles = (priority) => {
    if (priority === "high") {
      return {
        icon: AlertCircle,
        variant: "destructive",
        iconClass: "text-destructive",
        bgClass: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
      };
    }
    return {
      icon: Megaphone,
      variant: "default",
      iconClass: "text-primary",
      bgClass: "",
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Notices & Announcements
            </h1>
          </div>
          <p className="text-muted-foreground">
            Stay updated with the latest news and important notices
          </p>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="mt-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <Skeleton className="h-3 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="py-16 text-center">
              <Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No Announcements</h2>
              <p className="text-muted-foreground">
                There are no announcements at the moment. Check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Announcements List */
          <div className="space-y-4">
            {announcements.map((item) => {
              const { icon: Icon, variant, iconClass, bgClass } =
                getPriorityStyles(item.priority);
              const isRead = item.isRead;

              return (
                <Card
                  key={item._id}
                  className={`transition-shadow hover:shadow-md ${
                    !isRead
                      ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                      : ""
                  } ${item.priority === "high" ? bgClass : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 shrink-0 ${iconClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            {!isRead && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                            {item.priority === "high" && (
                              <Badge variant={variant} className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="text-sm text-muted-foreground">
                            <span>
                              Posted by {item.createdBy?.firstname}{" "}
                              {item.createdBy?.lastname}
                            </span>
                            <span className="mx-2">·</span>
                            <span
                              title={format(
                                new Date(item.publishedAt || item.createdAt),
                                "PPpp"
                              )}
                            >
                              {formatDistanceToNow(
                                new Date(item.publishedAt || item.createdAt),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                          {!isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(item._id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              {markAsReadMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
