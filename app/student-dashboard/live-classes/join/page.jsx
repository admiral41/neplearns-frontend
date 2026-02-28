"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ExternalLink, AlertTriangle } from "lucide-react";

function JoinLiveClassContent() {
  const params = useSearchParams();
  const router = useRouter();
  const joinUrl = params.get("url");

  if (!joinUrl) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Invalid Meeting Link</h2>
        <p className="text-muted-foreground text-center mb-6">
          The meeting link appears to be invalid or expired.
        </p>
        <Button onClick={() => router.push('/student-dashboard/livestreams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Live Classes
        </Button>
      </div>
    );
  }

  const handleOpenMeeting = () => {
    window.open(joinUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      alert("Meeting link copied to clipboard!");
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <ExternalLink className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">External Meeting</h1>
          <p className="text-muted-foreground">
            This live class is hosted on an external platform. Click the button below to join the meeting.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border shadow-sm">
            <div className="text-left">
              <p className="text-sm text-muted-foreground mb-1">Meeting URL:</p>
              <p className="text-sm break-all bg-gray-50 p-2 rounded">
                {joinUrl.length > 60 ? `${joinUrl.substring(0, 60)}...` : joinUrl}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleOpenMeeting}
              className="flex-1"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="lg"
            >
              Copy Link
            </Button>
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>You will be redirected to an external meeting platform.</p>
            <p className="mt-1">Make sure you have the required app installed (Zoom, Google Meet, etc.)</p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push('/student-dashboard/livestreams')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Live Classes
        </Button>
      </div>
    </div>
  );
}

export default function JoinLiveClassPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <JoinLiveClassContent />
    </Suspense>
  );
}