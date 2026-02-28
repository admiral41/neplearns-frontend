"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { XCircle } from "lucide-react";
import { useRejectRequest } from "@/lib/hooks/useTutoringRequest";

/**
 * RejectRequestDialog - Dialog for entering rejection reason
 * @param {boolean} open - Whether dialog is open
 * @param {Function} onOpenChange - Callback when dialog open state changes
 * @param {Object} request - The tutoring request being rejected
 * @param {Function} onSuccess - Callback after successful rejection
 */
export default function RejectRequestDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}) {
  const [reason, setReason] = useState("");

  // Rejection mutation
  const rejectMutation = useRejectRequest();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || !request?._id) return;

    rejectMutation.mutate(
      { requestId: request._id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason("");
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const handleClose = () => {
    setReason("");
    onOpenChange(false);
  };

  const getStudentName = () => {
    if (!request?.student) return "Unknown Student";
    return `${request.student.firstname || ""} ${request.student.lastname || ""}`.trim() || "Unknown Student";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Request</DialogTitle>
          <DialogDescription>
            Reject {getStudentName()}&apos;s request for{" "}
            <span className="font-medium">{request?.subject?.name || "this subject"}</span>.
            The student will be notified with your reason.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this request is being rejected..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent to the student via email.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!reason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                "Rejecting..."
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
