"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useApplications, useApproveApplication, useRejectApplication } from "@/lib/hooks/useAdmin";

// Helper to map experience years
const getExperienceLabel = (years) => {
  if (years === 0 || years === 1) return "Less than 1 year";
  if (years <= 3) return "1-3 years";
  if (years <= 5) return "3-5 years";
  if (years <= 10) return "5-10 years";
  return "10+ years";
};

export default function PendingApplications() {
  const { data: applicationsData, isLoading } = useApplications();
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  // Transform backend data
  const pendingApplications = (applicationsData?.data || []).map((app) => ({
    id: app._id,
    name: app.user ? `${app.user.firstname || ""} ${app.user.lastname || ""}`.trim() : "Unknown",
    email: app.user?.email || "",
    expertise: Array.isArray(app.user?.subjects) ? app.user.subjects.join(", ") : "",
    experience: getExperienceLabel(app.user?.teachingExperience || 0),
    appliedAt: app.createdAt ? new Date(app.createdAt) : new Date(),
  }));

  const handleQuickApprove = (id) => {
    approveMutation.mutate(id);
  };

  const handleQuickReject = (id) => {
    rejectMutation.mutate({ applicationId: id, reason: "Application rejected by admin." });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Instructor Applications
            </CardTitle>
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Instructor Applications
          </CardTitle>
          <Badge variant="secondary">{pendingApplications.length} pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingApplications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending applications
          </p>
        ) : (
          <>
            {pendingApplications.slice(0, 3).map((application) => (
              <div
                key={application.id}
                className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {application.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{application.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {application.expertise || "No subjects specified"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {application.experience} · Applied{" "}
                      {formatDistanceToNow(application.appliedAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleQuickApprove(application.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleQuickReject(application.id)}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-1" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            <Link href="/admin-dashboard/applications">
              <Button variant="outline" className="w-full" size="sm">
                View All Applications
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
