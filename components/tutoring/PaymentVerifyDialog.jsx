"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

/**
 * PaymentVerifyDialog - Dialog for approve/reject payment with notes input
 * Two-step flow:
 * 1. Initial: Show payment details
 * 2. After action selection: Show notes input and confirm button
 *
 * @param {boolean} open - Whether dialog is open
 * @param {Function} onOpenChange - Callback when dialog open state changes
 * @param {Object} payment - The payment being verified
 * @param {string} action - Pre-selected action: "approve" | "reject" | null
 * @param {Function} onVerify - Callback when verification is confirmed
 * @param {boolean} isPending - Whether the mutation is pending
 */
export default function PaymentVerifyDialog({
  open,
  onOpenChange,
  payment,
  action: initialAction,
  onVerify,
  isPending = false,
}) {
  const [action, setAction] = useState(initialAction);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Sync action with prop when dialog opens
  useEffect(() => {
    if (open) {
      setAction(initialAction);
      setAdminNotes("");
      setRejectionReason("");
    }
  }, [open, initialAction]);

  const getStudentName = () => {
    if (!payment?.enrollment?.student) return "this student";
    const { firstname, lastname } = payment.enrollment.student;
    return `${firstname || ""} ${lastname || ""}`.trim() || "this student";
  };

  const getSubjectName = () => {
    return payment?.enrollment?.subject?.name || "this subject";
  };

  const handleConfirm = () => {
    if (!payment?._id || !action) return;

    // Reject requires a reason
    if (action === "reject" && !rejectionReason.trim()) return;

    onVerify?.({
      id: payment._id,
      action,
      adminNotes: adminNotes.trim() || undefined,
      rejectionReason: action === "reject" ? rejectionReason.trim() : undefined,
    });
  };

  const handleCancel = () => {
    setAction(null);
    setAdminNotes("");
    setRejectionReason("");
    onOpenChange(false);
  };

  const isRejectWithoutReason = action === "reject" && !rejectionReason.trim();

  // Dialog title based on action
  const getTitle = () => {
    if (action === "approve") return "Approve Payment";
    if (action === "reject") return "Reject Payment";
    return "Verify Payment";
  };

  // Dialog description
  const getDescription = () => {
    if (action === "approve") {
      return "This will approve the payment and activate the student's subscription.";
    }
    if (action === "reject") {
      return "This will reject the payment. The student will be notified and must submit a new payment.";
    }
    return "Review the payment details and approve or reject.";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                action === "reject"
                  ? "bg-destructive/10"
                  : action === "approve"
                    ? "bg-green-100"
                    : "bg-primary/10"
              }`}
            >
              {action === "reject" ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : action === "approve" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-primary" />
              )}
            </div>
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          {/* Payment Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Student:</span>
              <span className="font-medium">{getStudentName()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{getSubjectName()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                NPR {payment?.amount?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          {/* Rejection Reason (required for reject) */}
          {action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a reason for rejection (e.g., invalid payment proof, amount mismatch)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
              {isRejectWithoutReason && (
                <p className="text-xs text-destructive">
                  A rejection reason is required.
                </p>
              )}
            </div>
          )}

          {/* Admin Notes (optional for both) */}
          {action && (
            <div className="space-y-2">
              <Label htmlFor="adminNotes">
                Admin Notes <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="adminNotes"
                placeholder="Add any internal notes about this payment..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          )}

          {/* Warning for rejection */}
          {action === "reject" && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                The student will be notified via email about this rejection with the
                reason you provide.
              </p>
            </div>
          )}

          {/* Success notice for approval */}
          {action === "approve" && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                Approving will activate the subscription immediately.
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          {action && (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending || isRejectWithoutReason}
              className={
                action === "reject"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {isPending ? (
                action === "approve" ? "Approving..." : "Rejecting..."
              ) : (
                <>
                  {action === "approve" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve Payment
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject Payment
                    </>
                  )}
                </>
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
