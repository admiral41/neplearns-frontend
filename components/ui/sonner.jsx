"use client";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:!text-inherit group-[.toast]:opacity-90",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "!bg-success !text-success-foreground !border-success",
          error:
            "!bg-destructive !text-destructive-foreground !border-destructive",
          info: "!bg-info !text-info-foreground !border-info",
          warning: "!bg-warning !text-warning-foreground !border-warning",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
