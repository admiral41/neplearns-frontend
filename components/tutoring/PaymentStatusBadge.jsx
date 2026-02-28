"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

/**
 * PaymentStatusBadge - Displays a color-coded badge based on payment status
 * @param {string} status - The payment status: pending, approved, rejected
 */
export default function PaymentStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "secondary",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      variant: "secondary",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
      icon: CheckCircle,
    },
    rejected: {
      label: "Rejected",
      variant: "secondary",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
