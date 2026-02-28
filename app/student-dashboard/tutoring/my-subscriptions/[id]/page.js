"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import SubscriptionStatusBadge from "@/components/tutoring/SubscriptionStatusBadge";
import PaymentUploadForm from "@/components/tutoring/PaymentUploadForm";
import PaymentHistoryList from "@/components/tutoring/PaymentHistoryList";
import { useSubscription } from "@/lib/hooks/useTutoringEnrollment";
import {
  useSubmitPayment,
  usePaymentHistory,
} from "@/lib/hooks/useTutoringPayment";

export default function SubscriptionDetailPage() {
  const params = useParams();
  const id = params?.id;

  const {
    data: subscriptionData,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch,
  } = useSubscription(id);

  const { data: payments, isLoading: paymentsLoading } = usePaymentHistory(id);

  const submitPayment = useSubmitPayment();

  const subscription = subscriptionData?.data || subscriptionData;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePaymentSubmit = (paymentData) => {
    submitPayment.mutate(paymentData, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  // Determine if payment form should be shown
  const shouldShowPaymentForm = () => {
    if (!subscription) return false;
    const { status, paymentStatus } = subscription;

    // Don't show if already pending verification
    if (paymentStatus === "pending_verification") return false;

    // Show for trial, pending, expired, or expired_grace subscriptions
    return (
      status === "trial" ||
      status === "pending" ||
      status === "expired" ||
      status === "expired_grace"
    );
  };

  // Loading state
  if (subscriptionLoading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (subscriptionError) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Failed to load subscription
              </h3>
              <p className="text-muted-foreground mb-4">
                {subscriptionError.message}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button asChild variant="outline">
                  <Link href="/student-dashboard/tutoring/my-subscriptions">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Subscriptions
                  </Link>
                </Button>
                <Button onClick={() => refetch()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Not found state
  if (!subscription) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Subscription not found
              </h3>
              <p className="text-muted-foreground mb-4">
                This subscription may have been deleted or you don't have access
                to it.
              </p>
              <Button asChild>
                <Link href="/student-dashboard/tutoring/my-subscriptions">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Subscriptions
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const {
    subject,
    instructor,
    status,
    paymentStatus,
    trialStartedAt,
    trialEndsAt,
    currentPeriodStart,
    currentPeriodEnd,
    monthlyPrice,
  } = subscription;

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button asChild variant="ghost" size="sm" className="h-8 px-2">
                <Link href="/student-dashboard/tutoring/my-subscriptions">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-lg sm:text-xl font-bold">
                Subscription Details
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              {subject?.name} tutoring subscription
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Subscription Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle>
                  <span className="text-xl">{subject?.name}</span>
                  <p className="text-sm font-normal text-muted-foreground">
                    NPR {monthlyPrice?.toLocaleString()}/month
                  </p>
                </CardTitle>
                <SubscriptionStatusBadge status={status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instructor info */}
              {instructor && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Your Instructor</p>
                  <p className="font-medium">
                    {instructor.firstname} {instructor.lastname}
                  </p>
                </div>
              )}

              {/* Date info based on status */}
              <div className="grid sm:grid-cols-2 gap-3">
                {status === "trial" && (
                  <>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Trial Started
                      </p>
                      <p className="font-medium">{formatDate(trialStartedAt)}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Trial Ends
                      </p>
                      <p className="font-medium">{formatDate(trialEndsAt)}</p>
                    </div>
                  </>
                )}

                {(status === "active" ||
                  status === "expired" ||
                  status === "expired_grace") && (
                  <>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Period Start
                      </p>
                      <p className="font-medium">
                        {formatDate(currentPeriodStart)}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        {status === "active" ? "Renews On" : "Expired On"}
                      </p>
                      <p className="font-medium">
                        {formatDate(currentPeriodEnd)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status Notification */}
          {paymentStatus === "pending_verification" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Payment Pending Verification
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Your payment proof has been submitted and is being reviewed.
                    You'll be notified once it's verified.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "active" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Subscription Active
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Your subscription is active until{" "}
                    {formatDate(currentPeriodEnd)}. You have full access to
                    tutoring sessions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Upload Form (conditional) */}
          {shouldShowPaymentForm() && (
            <PaymentUploadForm
              enrollmentId={id}
              amount={monthlyPrice}
              onSubmit={handlePaymentSubmit}
              isPending={submitPayment.isPending}
            />
          )}

          {/* Payment History */}
          <PaymentHistoryList payments={payments} isLoading={paymentsLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
