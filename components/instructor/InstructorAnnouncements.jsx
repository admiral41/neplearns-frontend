"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, AlertCircle, Megaphone, Check, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAnnouncements, useMarkAnnouncementRead } from "@/lib/hooks/useAnnouncements";

export default function InstructorAnnouncements() {
  const { data: response, isLoading } = useAnnouncements({ limit: 4 });
  const markAsReadMutation = useMarkAnnouncementRead();

  const announcements = response?.data?.announcements || [];

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const getPriorityStyles = (priority) => {
    if (priority === "high") {
      return {
        icon: AlertCircle,
        variant: "destructive",
        iconClass: "text-destructive",
      };
    }
    return {
      icon: Megaphone,
      variant: "default",
      iconClass: "text-primary",
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No announcements</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((item) => {
              const { icon: Icon, variant, iconClass } = getPriorityStyles(item.priority);
              const isRead = item.isRead;

              return (
                <div
                  key={item._id}
                  className={`p-3 border rounded-lg hover:shadow-sm transition-shadow ${
                    !isRead ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 ${iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {item.title}
                        </h4>
                        {item.priority === "high" && (
                          <Badge variant={variant} className="text-xs shrink-0">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {item.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.publishedAt || item.createdAt), { addSuffix: true })}
                        </p>
                        {!isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleMarkAsRead(item._id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            {markAsReadMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Read
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
