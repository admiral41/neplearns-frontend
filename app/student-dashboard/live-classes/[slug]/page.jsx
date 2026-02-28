"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { livestreamAPI } from "@/lib/api/livestream";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Video,
  Users,
  Calendar,
  Clock,
  Globe,
  Lock,
  Eye,
  Copy,
  ExternalLink,
  User,
  MessageSquare,
  Settings,
  ScreenShare,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  Timer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function StudentLivestreamPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  const [livestream, setLivestream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchLivestreamDetails();
    }
  }, [slug]);

  const fetchLivestreamDetails = async () => {
    try {
      setIsLoading(true);
      const response = await livestreamAPI.getLivestreamBySlug(slug);
      if (response.data) {
        setLivestream(response.data);
      } else {
        toast.error("Live class not found");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching livestream:", error);
      toast.error("Failed to load live class");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinStream = async () => {
    if (!livestream) return;

    try {
      setIsJoining(true);
      const response = await livestreamAPI.joinLivestream(
        livestream.streamSlug
      );
      const { meetingInfo } = response.data || {};

      if (meetingInfo) {
        setMeetingInfo(meetingInfo);
        setShowMeetingDialog(true);
      } else {
        toast.error("Failed to get meeting information");
      }
    } catch (error) {
      console.error("Error joining live class:", error);
      toast.error(error.message || "Failed to join live class");
    } finally {
      setIsJoining(false);
    }
  };

  const handleOpenMeeting = () => {
    if (meetingInfo?.url) {
      window.open(meetingInfo.url, "_blank");
      setShowMeetingDialog(false);
    }
  };

  const handleCopyMeetingLink = () => {
    if (livestream?.meetingUrl) {
      navigator.clipboard.writeText(livestream.meetingUrl);
      toast.success("Meeting link copied to clipboard!");
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "MMM dd, yyyy • hh:mm a");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (stream) => {
    switch (stream.status) {
      case "scheduled":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "live":
        return (
          <Badge className="bg-green-500 animate-pulse">
            <Video className="h-3 w-3 mr-1" />
            Live Now
          </Badge>
        );
      case "ended":
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ended
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getMeetingPlatformInfo = (stream) => {
    switch (stream.meetingType) {
      case "zoom":
        return {
          name: "Zoom",
          icon: "https://cdn-icons-png.flaticon.com/512/5968/5968865.png",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "google_meet":
        return {
          name: "Google Meet",
          icon: "https://cdn-icons-png.flaticon.com/512/5968/5968534.png",
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "microsoft_teams":
        return {
          name: "Microsoft Teams",
          icon: "https://cdn-icons-png.flaticon.com/512/5968/5968885.png",
          color: "text-blue-700",
          bgColor: "bg-blue-50",
        };
      default:
        return {
          name: "Custom Meeting",
          icon: "https://cdn-icons-png.flaticon.com/512/1055/1055644.png",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live class...</p>
        </div>
      </div>
    );
  }

  if (!livestream) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Live Class Not Found</h2>
          <p className="text-gray-600 mb-4">
            The live class you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const platform = getMeetingPlatformInfo(livestream);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <div className="p-4 border-b bg-white">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Live Classes
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {livestream.title}
                    </h1>
                    {getStatusBadge(livestream)}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`${platform.bgColor} ${platform.color} border-0`}
                    >
                      <img
                        src={platform.icon}
                        alt={platform.name}
                        className="h-3 w-3 mr-1"
                      />
                      {platform.name}
                    </Badge>
                    <p className="text-gray-600">
                      {livestream.course?.courseTitle}
                    </p>
                  </div>
                </div>

                {livestream.isPublic ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Enrolled Only
                  </Badge>
                )}
              </div>

              {livestream.description && (
                <p className="text-gray-700">{livestream.description}</p>
              )}
            </div>

            {/* Statistics */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Class Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {livestream.totalViews || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {livestream.peakViewers || 0}
                    </div>
                    <div className="text-sm text-gray-600">Peak Viewers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {livestream.participants?.filter((p) => !p.leftAt)
                        .length || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Current Participants
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Schedule Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Scheduled Start</span>
                    </div>
                    <span className="font-medium">
                      {formatDateTime(livestream.scheduledStartTime)}
                    </span>
                  </div>

                  {livestream.scheduledEndTime && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Scheduled End</span>
                      </div>
                      <span className="font-medium">
                        {formatDateTime(livestream.scheduledEndTime)}
                      </span>
                    </div>
                  )}

                  {livestream.actualStartTime && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Video className="h-4 w-4" />
                        <span>Actual Start</span>
                      </div>
                      <span className="font-medium">
                        {formatDateTime(livestream.actualStartTime)}
                      </span>
                    </div>
                  )}

                  {livestream.actualEndTime && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Timer className="h-4 w-4" />
                        <span>Actual End</span>
                      </div>
                      <span className="font-medium">
                        {formatDateTime(livestream.actualEndTime)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Meeting Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Meeting Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Meeting URL:
                    </div>
                    <div className="p-3 bg-gray-50 rounded border text-sm break-all">
                      {livestream.meetingUrl}
                    </div>
                  </div>

                  {livestream.meetingId && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Meeting ID:
                      </div>
                      <div className="p-3 bg-gray-50 rounded border text-sm font-mono">
                        {livestream.meetingId}
                      </div>
                    </div>
                  )}

                  {livestream.meetingInstructions && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Instructions:
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        {livestream.meetingInstructions}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lecturer Info */}
            {livestream.lecturers && livestream.lecturers.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Instructors
                  </h3>
                  <div className="space-y-3">
                    {livestream.lecturers.map((lecturer, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {lecturer.user?.firstname} {lecturer.user?.lastname}
                          </p>
                          <p className="text-sm text-gray-600">
                            Course Instructor
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Join Section */}
          <div className="space-y-6">
            {/* Join Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className="h-12 w-12"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Join Meeting
                  </h3>
                  <p className="text-sm text-gray-600">
                    Join the live class on {platform.name}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Platform:</span>
                      <span className="font-medium">{platform.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(livestream)}
                    </div>

                    {livestream.meetingPassword && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Password:</span>
                        <div className="flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          <span>Required</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {(livestream.status === "live" ||
                      livestream.status === "scheduled") && (
                      <Button
                        onClick={handleJoinStream}
                        disabled={
                          isJoining || livestream.status === "cancelled"
                        }
                        className="w-full"
                        size="lg"
                      >
                        {isJoining ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-5 w-5 mr-2" />
                            {livestream.status === "live"
                              ? "Join Meeting"
                              : "Preview Class"}
                          </>
                        )}
                      </Button>
                    )}

                    {livestream.status === "ended" &&
                      livestream.recordingUrl && (
                        <Button
                          onClick={() =>
                            window.open(livestream.recordingUrl, "_blank")
                          }
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          View Recording
                        </Button>
                      )}

                    <Button
                      onClick={handleCopyMeetingLink}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Meeting Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() =>
                      router.push(
                        `/student-dashboard/courses/${livestream.course?.courseSlug}`
                      )
                    }
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Course Page
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() =>
                      router.push("/student-dashboard/livestreams")
                    }
                  >
                    <Video className="h-4 w-4 mr-2" />
                    All Live Classes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Meeting Info Dialog */}
      {meetingInfo && (
        <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Join Meeting
              </DialogTitle>
              <DialogDescription>{livestream?.title}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <img
                  src={meetingInfo.icon}
                  alt={meetingInfo.platform}
                  className="h-8 w-8"
                />
                <div>
                  <div className="font-medium">{meetingInfo.platform}</div>
                  <div className="text-sm text-muted-foreground">
                    {livestream.course?.courseTitle}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meeting Information</Label>
                <div className="text-sm space-y-1">
                  {meetingInfo.id && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Meeting ID:</span>
                      <span className="font-mono">{meetingInfo.id}</span>
                    </div>
                  )}

                  {meetingInfo.hasPassword && (
                    <div className="flex items-center gap-2">
                      <Key className="h-3 w-3" />
                      <span>Password protected</span>
                    </div>
                  )}

                  {meetingInfo.instructions && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      {meetingInfo.instructions}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>You're joining as</Label>
                <div className="text-sm">
                  {meetingInfo.user?.name} ({meetingInfo.user?.email})
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMeetingDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleOpenMeeting}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in {meetingInfo.platform}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
