"use client";

import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft, BookOpen } from "lucide-react";
import SubscriptionCard from "@/components/tutoring/SubscriptionCard";
import { useMySubscriptions } from "@/lib/hooks/useTutoringEnrollment";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "trial", label: "Trial" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MySubscriptionsPage() {
  const { data, isLoading, error, refetch } = useMySubscriptions();

  const subscriptions = data?.data || [];

  // Filter subscriptions by status for tabs
  const filterSubscriptionsByStatus = (status) => {
    if (status === "all") return subscriptions;
    // Handle expired_grace as part of expired tab
    if (status === "expired") {
      return subscriptions.filter(
        (s) => s.status === "expired" || s.status === "expired_grace"
      );
    }
    return subscriptions.filter((s) => s.status === status);
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
              <h3 className="text-lg font-semibold mb-2">
                Failed to load subscriptions
              </h3>
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
              <h1 className="text-lg sm:text-xl font-bold">
                My Subscriptions
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              Manage your active tutoring subscriptions
            </p>
          </div>
          <Button asChild>
            <Link href="/student-dashboard/tutoring">Browse Subjects</Link>
          </Button>
        </div>

        {/* Empty state */}
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any tutoring subscriptions. Submit a tutoring
                request to get started.
              </p>
              <Button asChild>
                <Link href="/student-dashboard/tutoring">Browse Subjects</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Tabs with filtered subscriptions */
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              {STATUS_TABS.map((tab) => {
                const count = filterSubscriptionsByStatus(tab.value).length;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-sm"
                  >
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
              const filteredSubscriptions = filterSubscriptionsByStatus(
                tab.value
              );
              return (
                <TabsContent key={tab.value} value={tab.value}>
                  {filteredSubscriptions.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No {tab.value === "all" ? "" : tab.label.toLowerCase()}{" "}
                          subscriptions
                        </h3>
                        <p className="text-muted-foreground">
                          {tab.value === "all"
                            ? "You don't have any tutoring subscriptions yet."
                            : `You don't have any ${tab.label.toLowerCase()} subscriptions.`}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSubscriptions.map((subscription) => (
                        <SubscriptionCard
                          key={subscription._id}
                          subscription={subscription}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}

        {/* Info note */}
        {subscriptions.length > 0 && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Status guide:</strong> Trial subscriptions have a 2-day
              trial period. Active subscriptions renew monthly. Pending
              subscriptions are awaiting payment verification.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
