"use client";

import { useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  usePendingPayments,
  useVerifyPayment,
} from "@/lib/hooks/useTutoringPayment";
import AdminPaymentCard from "@/components/tutoring/AdminPaymentCard";
import PaymentVerifyDialog from "@/components/tutoring/PaymentVerifyDialog";

export default function AdminTutoringPaymentsPage() {
  // Dialog state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch pending payments
  const { data: payments, isLoading, isError, error, refetch } = usePendingPayments();
  const pendingPayments = payments || [];

  // Verify mutation
  const verifyMutation = useVerifyPayment();

  // Handle card action click
  const handleVerifyClick = (payment, action) => {
    setSelectedPayment(payment);
    setSelectedAction(action);
    setDialogOpen(true);
  };

  // Handle dialog confirmation
  const handleVerifyConfirm = (data) => {
    verifyMutation.mutate(data, {
      onSuccess: () => {
        setDialogOpen(false);
        setSelectedPayment(null);
        setSelectedAction(null);
      },
    });
  };

  // Handle dialog close
  const handleDialogClose = (open) => {
    if (!open) {
      setSelectedPayment(null);
      setSelectedAction(null);
    }
    setDialogOpen(open);
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1 flex items-center gap-2">
              <CreditCard className="h-7 w-7" />
              Payment Verifications
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Review and verify student payment submissions
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Card - Display only, NOT clickable per CONTEXT.md */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verifications</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "-" : pendingPayments.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div>
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Failed to load payments
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {error?.message || "An error occurred while fetching pending payments."}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Payments Grid */}
          {!isLoading && !isError && pendingPayments.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingPayments.map((payment) => (
                <AdminPaymentCard
                  key={payment._id}
                  payment={payment}
                  onVerify={handleVerifyClick}
                  isVerifying={verifyMutation.isPending}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && pendingPayments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <CheckCircle2 className="h-12 w-12 text-green-600/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No pending payments
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                All payment verifications are up to date. New payment submissions
                will appear here for review.
              </p>
            </div>
          )}
        </div>

        {/* Verify Dialog */}
        <PaymentVerifyDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          payment={selectedPayment}
          action={selectedAction}
          onVerify={handleVerifyConfirm}
          isPending={verifyMutation.isPending}
        />
      </div>
    </AdminDashboardLayout>
  );
}
