"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, ImageIcon, CreditCard } from "lucide-react";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * PaymentUploadForm - Form for uploading payment proof screenshot
 * @param {string} enrollmentId - The enrollment ID
 * @param {number} amount - The payment amount (NPR)
 * @param {function} onSubmit - Callback function when form is submitted
 * @param {boolean} isPending - Whether the form submission is in progress
 */
export default function PaymentUploadForm({
  enrollmentId,
  amount,
  onSubmit,
  isPending = false,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a payment proof image");
      return;
    }

    onSubmit({
      enrollmentId,
      paymentMethod: "bank_transfer",
      studentNotes: notes.trim() || undefined,
      proofFile: file,
    });
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Create a synthetic event to reuse handleFileChange logic
      const syntheticEvent = {
        target: { files: [droppedFile] },
      };
      handleFileChange(syntheticEvent);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-primary" />
          Submit Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Display */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-2xl font-bold text-primary">
              NPR {amount?.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Transfer this amount via bank transfer and upload the screenshot
              below
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Payment Proof Screenshot</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={isPending}
            />

            {!preview ? (
              <div
                onClick={handleDropZoneClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, or WebP (max 5MB)
                </p>
              </div>
            ) : (
              <div className="relative border rounded-lg p-2 bg-muted/30">
                <img
                  src={preview}
                  alt="Payment proof preview"
                  className="max-h-64 mx-auto rounded object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveFile}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 mt-2 p-2 bg-background rounded">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{file?.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {(file?.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about your payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              disabled={isPending}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {notes.length}/500
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!file || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit Payment Proof
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your payment will be verified within 24 hours
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
