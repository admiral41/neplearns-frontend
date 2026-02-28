"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, X } from "lucide-react";

export default function ZoomMeeting({
  meetingConfig,
  onLeave,
  onError,
}) {
  const meetingContainerRef = useRef(null);
  const clientRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!meetingConfig || !meetingContainerRef.current) return;

    let isMounted = true;

    const initZoom = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ✅ DYNAMIC IMPORT (CRITICAL)
        const ZoomMtgEmbedded = (
          await import("@zoom/meetingsdk/embedded")
        ).default;

        const zoomClient = ZoomMtgEmbedded.createClient();
        clientRef.current = zoomClient;

        await zoomClient.init({
          zoomAppRoot: meetingContainerRef.current,
          language: "en-US",
          customize: {
            video: {
              isResizable: true,
            },
            meetingInfo: [
              "topic",
              "host",
              "participant",
              "dc",
              "enctype",
            ],
          },
        });

        await zoomClient.join({
          sdkKey: meetingConfig.sdk.sdkKey,
          signature: meetingConfig.sdk.signature,
          meetingNumber: meetingConfig.sdk.meetingNumber,
          password: meetingConfig.meetingPassword,
          userName: meetingConfig.sdk.userName,
          userEmail: meetingConfig.sdk.userEmail,
        });

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("❌ Zoom error:", err);
        if (isMounted) {
          setError(err.message || "Failed to join meeting");
          setIsLoading(false);
        }
        onError?.(err);
      }
    };

    initZoom();

    return () => {
      isMounted = false;
      if (clientRef.current) {
        try {
          clientRef.current.leaveMeeting();
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
    };
  }, [meetingConfig]);

  const handleLeaveMeeting = async () => {
    try {
      await clientRef.current?.leaveMeeting();
    } catch (e) {
      console.error(e);
    }
    onLeave?.();
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Joining meeting…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10 p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <p className="font-semibold mb-2">Failed to join</p>
              <p className="text-sm">{error}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
                <Button size="sm" variant="outline" onClick={onLeave}>
                  Go Back
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Leave Button */}
      {!isLoading && !error && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-4 right-4 z-20"
          onClick={handleLeaveMeeting}
        >
          <X className="h-4 w-4 mr-2" />
          Leave
        </Button>
      )}

      {/* Zoom Mount */}
      <div
        ref={meetingContainerRef}
        className="w-full h-full"
      />
    </div>
  );
}
