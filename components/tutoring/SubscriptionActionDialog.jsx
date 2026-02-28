"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, XCircle, AlertTriangle } from "lucide-react";

// Action configuration
const ACTION_CONFIG = {
  activate: {
    title: "Activate Subscription",
    description:
      "This will activate a 1-month subscription period for this student.",
    buttonLabel: "Activate",
    buttonVariant: "default",
    icon: PlayCircle,
    iconColor: "text-green-600",
  },
  pause: {
    title: "Pause Subscription",
    description:
      "This will pause the subscription. The student will not have access until resumed.",
    buttonLabel: "Pause",
    buttonVariant: "outline",
    icon: PauseCircle,
    iconColor: "text-yellow-600",
  },
  cancel: {
    title: "Cancel Subscription",
    description:
      "This will permanently cancel the subscription. The student will lose access immediately. This action cannot be undone.",
    buttonLabel: "Cancel Subscription",
    buttonVariant: "destructive",
    icon: XCircle,
    iconColor: "text-destructive",
  },
};

/**
 * SubscriptionActionDialog - Simple confirmation dialog for activate/pause/cancel actions
 * @param {boolean} open - Whether dialog is open
 * @param {Function} onOpenChange - Callback when dialog open state changes
 * @param {Object} subscription - The subscription being acted upon
 * @param {string} action - The action type: "activate" | "pause" | "cancel"
 * @param {Function} onConfirm - Callback when action is confirmed
 * @param {boolean} isPending - Whether the mutation is pending
 */
export default function SubscriptionActionDialog({
  open,
  onOpenChange,
  subscription,
  action,
  onConfirm,
  isPending = false,
}) {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.activate;
  const Icon = config.icon;

  const handleConfirm = () => {
    if (subscription?._id) {
      onConfirm?.(subscription._id);
    }
  };

  const handleClose = () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${action === "cancel" ? "bg-destructive/10" : action === "pause" ? "bg-yellow-100" : "bg-green-100"}`}
            >
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Student:</span>
              <span className="font-medium">{getStudentName()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{getSubjectName()}</span>
            </div>
            {subscription?.status && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-medium capitalize">
                  {subscription.status.replace("_", " ")}
                </span>
              </div>
            )}
          </div>

          {action === "cancel" && (
            <div className="flex items-start gap-2 mt-4 p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                Warning: This action is permanent and cannot be undone. The student
                will be notified via email.
              </p>
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
            Go Back
          </Button>
          <Button
            type="button"
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              `${config.buttonLabel.replace(/e$/, "")}ing...`
            ) : (
              <>
                <Icon className="h-4 w-4 mr-1" />
                {config.buttonLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
