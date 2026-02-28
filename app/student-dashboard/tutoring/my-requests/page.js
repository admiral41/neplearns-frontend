"use client";

import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft, ClipboardList } from "lucide-react";
import RequestCard from "@/components/tutoring/RequestCard";
import { useMyTutoringRequests } from "@/lib/hooks/useTutoringRequest";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "enrolled", label: "Enrolled" },
  { value: "rejected", label: "Rejected" },
];

export default function MyTutoringRequestsPage() {
  const { data, isLoading, error, refetch } = useMyTutoringRequests();

  const requests = data?.data || [];

  // Filter requests by status for tabs
  const filterRequestsByStatus = (status) => {
    if (status === "all") return requests;
    return requests.filter((r) => r.status === status);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96 mb-6" />
          <Skeleton className="h-10 w-full max-w-lg mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load requests</h3>
              <p className="text-muted-foreground mb-4">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="text-primary hover:underline"
              >
                Try again
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button asChild variant="ghost" size="sm" className="h-8 px-2">
                <Link href="/student-dashboard/tutoring">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-lg sm:text-xl font-bold">My Tutoring Requests</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              Track the status of your tutoring requests
            </p>
          </div>
          <Button asChild>
            <Link href="/student-dashboard/tutoring">
              Browse Subjects
            </Link>
          </Button>
        </div>

        {/* Empty state */}
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any tutoring requests. Browse subjects to get started.
              </p>
              <Button asChild>
                <Link href="/student-dashboard/tutoring">
                  Browse Subjects
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Tabs with filtered requests */
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              {STATUS_TABS.map((tab) => {
                const count = filterRequestsByStatus(tab.value).length;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-sm">
                    {tab.label}
                    {count > 0 && (
                      <span className="ml-1.5 text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {STATUS_TABS.map((tab) => {
              const filteredRequests = filterRequestsByStatus(tab.value);
              return (
                <TabsContent key={tab.value} value={tab.value}>
                  {filteredRequests.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No {tab.value === "all" ? "" : tab.label.toLowerCase()} requests
                        </h3>
                        <p className="text-muted-foreground">
                          {tab.value === "all"
                            ? "You haven't submitted any tutoring requests yet."
                            : `You don't have any ${tab.label.toLowerCase()} requests.`}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRequests.map((request) => (
                        <RequestCard key={request._id} request={request} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}

        {/* Info note */}
        {requests.length > 0 && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Status guide:</strong> Pending requests are waiting for admin review.
              Assigned requests have an instructor matched - you'll receive email notification.
              Enrolled means you're actively receiving tutoring.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
