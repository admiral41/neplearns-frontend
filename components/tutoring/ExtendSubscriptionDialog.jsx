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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarPlus } from "lucide-react";

/**
 * ExtendSubscriptionDialog - Dialog for entering days to extend subscription
 * @param {boolean} open - Whether dialog is open
 * @param {Function} onOpenChange - Callback when dialog open state changes
 * @param {Object} subscription - The subscription being extended
 * @param {Function} onConfirm - Callback when extension is confirmed (receives { id, days })
 * @param {boolean} isPending - Whether the mutation is pending
 */
export default function ExtendSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onConfirm,
  isPending = false,
}) {
  const [days, setDays] = useState(7);
  const [error, setError] = useState("");

  const handleDaysChange = (e) => {
    const value = e.target.value;
    setError("");

    // Allow empty input during typing
    if (value === "") {
      setDays("");
      return;
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setError("Please enter a valid number");
      return;
    }

    if (numValue < 1) {
      setError("Minimum extension is 1 day");
      setDays(1);
      return;
    }

    if (numValue > 30) {
      setError("Maximum extension is 30 days");
      setDays(30);
      return;
    }

    setDays(numValue);
  };

  const handleConfirm = () => {
    if (!subscription?._id || !days || days < 1 || days > 30) return;

    onConfirm?.({ id: subscription._id, days: parseInt(days, 10) });
  };

  const handleClose = () => {
    setDays(7);
    setError("");
    onOpenChange(false);
  };

  const getStudentName = () => {
    if (!subscription?.student) return "this student";
    const name = `${subscription.student.firstname || ""} ${subscription.student.lastname || ""}`.trim();
    return name || "this student";
  };

  const getSubjectName = () => {
    return subscription?.subject?.name || "this subject";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate new end date
  const calculateNewEndDate = () => {
    if (!days || days < 1) return null;

    let baseDate;
    if (subscription?.currentPeriodEnd) {
      baseDate = new Date(subscription.currentPeriodEnd);
    } else if (subscription?.trialEndsAt) {
      baseDate = new Date(subscription.trialEndsAt);
    } else {
      baseDate = new Date();
    }

    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + parseInt(days, 10));
    return newDate;
  };

  const newEndDate = calculateNewEndDate();
  const isValid = days && days >= 1 && days <= 30 && !error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <CalendarPlus className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle>Extend Subscription</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Add additional days to the subscription period for{" "}
            <span className="font-medium">{getStudentName()}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Subscription Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{getSubjectName()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current End Date:</span>
              <span className="font-medium">
                {formatDate(subscription?.currentPeriodEnd || subscription?.trialEndsAt)}
              </span>
            </div>
          </div>

          {/* Days Input */}
          <div className="space-y-2">
            <Label htmlFor="days">Extension Days (1-30)</Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={handleDaysChange}
              placeholder="Enter number of days"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Preview */}
          {isValid && newEndDate && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">New End Date:</span>
                <span className="font-semibold text-green-800">
                  {formatDate(newEndDate)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid || isPending}
          >
            {isPending ? (
              "Extending..."
            ) : (
              <>
                <CalendarPlus className="h-4 w-4 mr-1" />
                Extend by {days || 0} {days === 1 ? "Day" : "Days"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
