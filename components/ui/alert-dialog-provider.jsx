"use client";

import { createContext, useContext, useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const AlertDialogContext = createContext();

export function AlertDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const resolveRef = useRef(null);

  const showAlert = ({
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    variant = "default",
  }) => {
    setDialog({
      title,
      description,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      variant,
    });
  };

  const showConfirmation = ({
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
  }) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({
        title,
        description,
        confirmText,
        cancelText,
        variant,
        isPromise: true,
      });
    });
  };

  const showPrompt = ({
    title,
    description,
    inputLabel = "Reason",
    inputPlaceholder = "Enter reason...",
    inputRequired = true,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
  }) => {
    setInputValue("");
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({
        title,
        description,
        inputLabel,
        inputPlaceholder,
        inputRequired,
        confirmText,
        cancelText,
        variant,
        isPrompt: true,
      });
    });
  };

  const hideAlert = () => {
    setDialog(null);
    setInputValue("");
  };

  const handleConfirm = () => {
    if (dialog?.isPrompt) {
      if (dialog?.inputRequired && !inputValue.trim()) {
        return; // Don't close if required and empty
      }
      resolveRef.current?.({ confirmed: true, value: inputValue.trim() });
    } else if (dialog?.isPromise) {
      resolveRef.current?.(true);
    } else {
      dialog?.onConfirm?.();
    }
    hideAlert();
  };

  const handleCancel = () => {
    if (dialog?.isPrompt) {
      resolveRef.current?.({ confirmed: false, value: null });
    } else if (dialog?.isPromise) {
      resolveRef.current?.(false);
    } else {
      dialog?.onCancel?.();
    }
    hideAlert();
  };

  const isConfirmDisabled = dialog?.isPrompt && dialog?.inputRequired && !inputValue.trim();

  return (
    <AlertDialogContext.Provider value={{ showAlert, showConfirmation, showPrompt, hideAlert }}>
      {children}

      <AlertDialog open={!!dialog} onOpenChange={handleCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {dialog?.isPrompt && (
            <div className="py-2">
              <Label htmlFor="prompt-input" className="text-sm font-medium">
                {dialog?.inputLabel} {dialog?.inputRequired && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="prompt-input"
                placeholder={dialog?.inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {dialog?.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className={
                dialog?.variant === "success"
                  ? "bg-success hover:bg-success/90"
                  : dialog?.variant === "destructive"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {dialog?.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
}

export function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error("useAlertDialog must be used within AlertDialogProvider");
  }
  return context;
}
