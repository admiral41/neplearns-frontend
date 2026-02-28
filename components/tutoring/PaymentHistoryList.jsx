"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, ExternalLink, AlertTriangle } from "lucide-react";
import PaymentStatusBadge from "./PaymentStatusBadge";

/**
 * PaymentHistoryList - Displays a list of payments for an enrollment
 * @param {Array} payments - Array of payment objects
 * @param {boolean} isLoading - Whether the data is loading
 */
export default function PaymentHistoryList({ payments = [], isLoading = false }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5 text-primary" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="py-8 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No payments yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Submit a payment to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <PaymentHistoryItem key={payment._id} payment={payment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentHistoryItem({ payment }) {
  const {
    _id,
    amount,
    status,
    paymentMethod,
    proofUrl,
    createdAt,
    rejectionReason,
    verifiedAt,
  } = payment;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      bank_transfer: "Bank Transfer",
      esewa: "eSewa",
      khalti: "Khalti",
      fonepay: "FonePay",
    };
    return methods[method] || method;
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-lg">
            NPR {amount?.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(createdAt)}
          </p>
        </div>
        <PaymentStatusBadge status={status} />
      </div>

      {/* Details Row */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          Via {formatPaymentMethod(paymentMethod)}
        </span>
        {status === "approved" && verifiedAt && (
          <span className="text-green-600">
            Verified {formatDate(verifiedAt)}
          </span>
        )}
      </div>

      {/* Rejection Reason */}
      {status === "rejected" && rejectionReason && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Payment Rejected
              </p>
              <p className="text-sm text-red-600 mt-1">{rejectionReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Proof Image Thumbnail */}
      {proofUrl && (
        <div className="flex items-center gap-3">
          <a
            href={proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative shrink-0"
          >
            <img
              src={proofUrl}
              alt="Payment proof"
              className="w-16 h-16 object-cover rounded-md border bg-muted"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <ExternalLink className="h-4 w-4 text-white" />
            </div>
          </a>
          <a
            href={proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View full image
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
