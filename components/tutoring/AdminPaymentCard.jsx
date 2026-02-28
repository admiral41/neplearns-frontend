"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Clock,
  CreditCard,
  ExternalLink,
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

// Payment method display config
const METHOD_CONFIG = {
  esewa: { label: "eSewa", className: "bg-green-100 text-green-800" },
  khalti: { label: "Khalti", className: "bg-purple-100 text-purple-800" },
  bank_transfer: { label: "Bank Transfer", className: "bg-blue-100 text-blue-800" },
  cash: { label: "Cash", className: "bg-gray-100 text-gray-800" },
};

/**
 * AdminPaymentCard - Card displaying pending payment for admin review
 * @param {Object} payment - The payment object to display
 * @param {Function} onVerify - Callback when action button is clicked (payment, action)
 * @param {boolean} isVerifying - Whether a verification is in progress
 */
export default function AdminPaymentCard({ payment, onVerify, isVerifying }) {
  const {
    _id,
    student,
    enrollment,
    amount,
    paymentMethod,
    proofUrl,
    studentNotes,
    createdAt,
  } = payment;

  const methodConfig = METHOD_CONFIG[paymentMethod] || METHOD_CONFIG.bank_transfer;

  const getStudentName = () => {
    if (!student) return "Unknown Student";
    const { firstname, lastname } = student;
    return `${firstname || ""} ${lastname || ""}`.trim() || "Unknown Student";
  };

  const getSubjectName = () => {
    return enrollment?.subject?.name || "Unknown Subject";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "-";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">
                NPR {amount?.toLocaleString() || 0}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {getSubjectName()}
              </p>
            </div>
          </div>
          <Badge className={methodConfig.className}>{methodConfig.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        {/* Student Info */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">{getStudentName()}</span>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Subject:</span>
          <span className="font-medium truncate">{getSubjectName()}</span>
        </div>

        {/* Submitted Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span>Submitted: {formatDate(createdAt)}</span>
        </div>

        {/* Student Notes */}
        {studentNotes && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{studentNotes}</p>
            </div>
          </div>
        )}

        {/* Proof Image */}
        {proofUrl && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">Payment Proof:</p>
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group"
            >
              <img
                src={proofUrl}
                alt="Payment proof"
                className="w-full max-h-48 object-contain rounded-lg border bg-muted/30 hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                <span className="bg-background/90 text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Full Size
                </span>
              </div>
            </a>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t gap-2">
        <Button
          className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
          variant="outline"
          onClick={() => onVerify?.(payment, "approve")}
          disabled={isVerifying}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Button
          className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
          variant="outline"
          onClick={() => onVerify?.(payment, "reject")}
          disabled={isVerifying}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
