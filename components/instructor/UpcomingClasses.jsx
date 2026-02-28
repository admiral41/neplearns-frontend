"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Calendar, Clock, Users } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

// Status badge mapping
const getStatusBadge = (status) => {
  const statusMap = {
    upcoming: { label: "Upcoming", variant: "default" },
    scheduled: { label: "Scheduled", variant: "secondary" },
    live: { label: "Live", variant: "destructive" },
    completed: { label: "Completed", variant: "outline" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };
  return statusMap[status] || { label: status, variant: "secondary" };
};

// Helper to safely parse date
const parseDate = (dateValue) => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  const parsed = parseISO(dateValue);
  return isValid(parsed) ? parsed : null;
};

export default function UpcomingClasses({ liveClasses = [], isLoading = false, onStartClass }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Upcoming Live Classes</CardTitle>
        <Link href="/instructor-dashboard/live-classes">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border">
              <div className="flex items-start gap-2 mb-2">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))
        ) : liveClasses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming live classes</p>
            <Link href="/instructor-dashboard/live-classes">
              <Button size="sm" className="mt-3">
                Schedule a Class
              </Button>
            </Link>
          </div>
        ) : (
          liveClasses.slice(0, 5).map((liveClass) => {
            const statusBadge = getStatusBadge(liveClass.status);
            const scheduledDate = parseDate(liveClass.scheduledAt || liveClass.startTime);

            return (
              <div
                key={liveClass._id || liveClass.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Video className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{liveClass.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {liveClass.course?.courseTitle || liveClass.courseName || "Course"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusBadge.variant} className="shrink-0">
                    {statusBadge.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {scheduledDate && (
                    <>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(scheduledDate, "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(scheduledDate, "h:mm a")}
                      </span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {liveClass.registeredCount || liveClass.registeredStudents || 0} registered
                  </span>
                </div>
                <div className="flex justify-end mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartClass?.(liveClass._id || liveClass.id)}
                    disabled={liveClass.status === "completed" || liveClass.status === "cancelled"}
                  >
                    {liveClass.status === "live" ? "Join Class" : "Start Class"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
